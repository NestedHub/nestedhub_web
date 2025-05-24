from fastapi import FastAPI, Depends, HTTPException
from sqlmodel import Session, create_engine, select
from sqlmodel import SQLModel
from typing import List
from pydantic import BaseModel
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from surprise import SVD, Dataset, Reader
from surprise.model_selection import train_test_split
import pandas as pd
import os
from models import Property, PropertyPricing, WishList, PropertyView, Review, User, ViewingRequest, Feature
from enums import PropertyStatusEnum, ReviewStatusEnum
from sqlalchemy.orm import joinedload
from sqlalchemy import func
import logging


# Setup logging at the top
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Hybrid Recommendation Server")

# Database connection
DATABASE_URL = (
    f"postgresql://{os.getenv('POSTGRES_USER')}:"
    f"{os.getenv('POSTGRES_PASSWORD')}@"
    f"{os.getenv('POSTGRES_SERVER')}:"
    f"{os.getenv('POSTGRES_PORT')}/"
    f"{os.getenv('POSTGRES_DB')}"
)
engine = create_engine(DATABASE_URL)


def get_session():
    with Session(engine) as session:
        yield session

# Pydantic model for response


class RecommendationResponse(BaseModel):
    property_ids: List[int]

# Hybrid Recommendation


def get_hybrid_recommendations(user_id: int, session: Session, top_n: int = 10, content_weight: float = 0.6) -> List[int]:
    # Fetch user interactions
    wishlist = session.exec(select(WishList).where(
        WishList.user_id == user_id)).all()
    views = session.exec(select(PropertyView).where(
        PropertyView.user_id == user_id)).all()
    reviews = session.exec(select(Review).where(
        Review.user_id == user_id)).all()
    interacted_property_ids = [
        item.property_id for item in wishlist + views + reviews]

    # Fetch all available properties with location and features
    properties = session.exec(
        select(Property)
        .where(Property.status == PropertyStatusEnum.available)
        .options(
            joinedload(Property.pricing),
            joinedload(Property.property_location),
            joinedload(Property.features)
        )
    ).unique().all()
    if not properties:
        return []

    # Fallback for new users
    if not interacted_property_ids:
        popular_properties = session.exec(
            select(Property)
            .where(Property.status == PropertyStatusEnum.available)
            .join(PropertyView, isouter=True)
            .group_by(Property.property_id)
            .order_by(func.count(PropertyView.view_id).desc())
            .limit(top_n)
        ).all()
        return [p.property_id for p in popular_properties]

    # Fetch all features to create a feature list for one-hot encoding
    all_features = session.exec(select(Feature)).all()
    feature_dict = {f.feature_id: i for i, f in enumerate(all_features)}

    # Create feature vectors
    descriptions = [p.description or "" for p in properties]
    tfidf = TfidfVectorizer(stop_words="english")
    tfidf_matrix = tfidf.fit_transform(descriptions)

    # Numerical features including land_area, floor_area
    numerical_features = np.array([
        [
            p.bedrooms,
            p.bathrooms,
            float(p.pricing.rent_price if p.pricing else 0),
            float(p.land_area),
            float(p.floor_area)
        ] for p in properties
    ])
    numerical_features = (numerical_features - numerical_features.mean(axis=0)
                          ) / (numerical_features.std(axis=0) + 1e-8)

    # One-hot encode features (amenities)
    feature_matrix = np.zeros((len(properties), len(feature_dict)))
    for i, p in enumerate(properties):
        for f in p.features:
            if f.feature_id in feature_dict:
                feature_matrix[i, feature_dict[f.feature_id]] = 1

    # Combine all features
    feature_matrix = np.hstack(
        [tfidf_matrix.toarray(), numerical_features, feature_matrix])

    # Compute user profile
    interacted_indices = [i for i, p in enumerate(
        properties) if p.property_id in interacted_property_ids]
    weights = []
    for pid in [properties[i].property_id for i in interacted_indices]:
        if any(w.property_id == pid for w in wishlist):
            weights.append(2.0)
        elif any(r.property_id == pid for r in reviews):
            weights.append(1.5)
        else:
            weights.append(1.0)
    user_profile = np.average(
        feature_matrix[interacted_indices], axis=0, weights=weights)

    # Compute content-based scores with location boost
    content_scores = cosine_similarity([user_profile], feature_matrix)[0]

    # Location-based score (city matching)
    user_cities = {
        properties[i].property_location.city_id for i in interacted_indices if properties[i].property_location}
    location_scores = np.array([
        1.0 if p.property_location and p.property_location.city_id in user_cities else 0.5
        for p in properties
    ])
    content_scores = 0.8 * content_scores + 0.2 * location_scores
    content_scores = (content_scores - content_scores.min()) / \
        (content_scores.max() - content_scores.min() + 1e-8)

    # Collaborative Filtering
    interactions = [(r.user_id, r.property_id, float(r.rating))
                    for r in session.exec(select(Review).where(Review.status == ReviewStatusEnum.approved)).all()]
    interactions += [(w.user_id, w.property_id, 5.0)
                     for w in session.exec(select(WishList)).all()]
    interactions += [(v.user_id, v.property_id, 3.0)
                     for v in session.exec(select(PropertyView)).all()]
    interactions += [(vr.user_id, vr.property_id, 4.0)
                     for vr in session.exec(select(ViewingRequest)).all()]

    # Calculate average rating for new properties
    avg_rating = np.mean(
        [rating for _, _, rating in interactions]) if interactions else 3.0

    # Load into surprise
    collab_scores = np.zeros(len(properties))
    if interactions:
        reader = Reader(rating_scale=(1, 5))
        data = Dataset.load_from_df(pd.DataFrame(interactions, columns=[
                                    "user_id", "property_id", "rating"]), reader)
        trainset, _ = train_test_split(data, test_size=0.2, random_state=42)
        algo = SVD()
        algo.fit(trainset)
        collab_scores = np.array([
            algo.predict(user_id, p.property_id).est if p.property_id in set(i[1] for i in interactions)
            else avg_rating
            for p in properties
        ])
        collab_scores = (collab_scores - collab_scores.min()) / \
            (collab_scores.max() - collab_scores.min() + 1e-8)

    # Combine scores
    hybrid_scores = content_weight * content_scores + \
        (1 - content_weight) * collab_scores
    top_indices = np.argsort(hybrid_scores)[::-1][:top_n]
    return [properties[i].property_id for i in top_indices if properties[i].property_id not in interacted_property_ids]

# Endpoint


@app.get("/recommend/hybrid/{user_id}", response_model=RecommendationResponse)
async def hybrid_recommendations(user_id: int, session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.user_id == user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    try:
        recommendations = get_hybrid_recommendations(user_id, session)
        return RecommendationResponse(property_ids=recommendations)
    except Exception as e:
        logger.exception("Error generating recommendations")  # Logs full traceback
        raise HTTPException(status_code=500, detail=str(e))  # Optional: show error for easier debug

# Create tables on startup


@app.on_event("startup")
async def on_startup():
    pass
