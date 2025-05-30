from sqlalchemy.orm import Session
from sqlmodel import Session, create_engine, select
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.exc import IntegrityError
from app.core.config import settings
from app.models.models import City, District, Commune, User, PropertyCategory, Property, PropertyMedia, PropertyPricing, PropertyLocation, Review, ViewingRequest, WishList
from app.core.security import get_password_hash
from app.models.enums import UserRole, PropertyStatusEnum, MediaType, ReviewStatusEnum, ViewingRequestStatusEnum
from datetime import datetime, date, timedelta, timezone
from decimal import Decimal
import random
import hashlib
import csv
import logging
from app.core.security import get_password_hash

logger = logging.getLogger(__name__)

# 🔒 Synchronous engine
sync_engine = create_engine(
    str(settings.SQLALCHEMY_DATABASE_URI),
    echo=True  # Optional: set to False in production
)

# ⚡ Asynchronous engine
async_engine = create_async_engine(
    str(settings.SQLALCHEMY_DATABASE_URI).replace(
        "postgresql://", "postgresql+asyncpg://"
    ),
    echo=True  # Optional: set to False in production
)

# 🔒 Synchronous session factory
def get_sync_session():
    with Session(sync_engine) as session:
        yield session

# ⚡ Asynchronous session factory
async def get_async_session():
    async with AsyncSession(async_engine) as session:
        yield session

def get_or_create(session: Session, model, **kwargs):
    """Get an existing record or create a new one."""
    instance = session.exec(select(model).filter_by(**kwargs)).first()
    if instance:
        return instance
    else:
        instance = model(**kwargs)
        session.add(instance)
        session.flush()  # Flush to assign PKs
        return instance  # Commit later after batch

def init_db(session: Session) -> None:
    # Load Property Categories from CSV
    pass
    '''with open('app/data/property_categories.csv', mode='r', newline='', encoding='utf-8') as file:
        reader = csv.DictReader(file)

        category_names = set()
        categories = []

        for row in reader:
            category_name = row['category_name'].strip()

            if category_name in category_names:
                continue  # Already prepared for insert in-memory

            # Check if it already exists in DB
            existing_category = session.exec(
                select(PropertyCategory).where(
                    PropertyCategory.category_name == category_name)
            ).first()

            if not existing_category:
                category = PropertyCategory(category_name=category_name)
                categories.append(category)
                category_names.add(category_name)
                logger.info(f"Prepared category: {category_name}")
            else:
                logger.info(f"Category '{category_name}' already exists, skipping.")

        if categories:
            session.add_all(categories)

    # Load Cambodia Admin Data from CSV
    with open('app/data/cambodia_admin_nested.csv', mode='r', newline='', encoding='utf-8') as file:
        reader = csv.DictReader(file)

        cities = {}
        districts = {}
        communes = []

        for row in reader:
            city_name = row['city_name']
            district_name = row['district_name']
            commune_name = row['commune_name']

            # Get or create City by name
            if city_name not in cities:
                city = get_or_create(session, City, city_name=city_name)
                cities[city_name] = city
            else:
                city = cities[city_name]

            # Use compound key (district_name + city_id) to avoid duplicates
            district_key = (district_name, city.city_id)
            if district_key not in districts:
                district = get_or_create(
                    session, District,
                    district_name=district_name,
                    city_id=city.city_id
                )
                districts[district_key] = district
            else:
                district = districts[district_key]

            # Use compound key (commune_name + district_id) to avoid duplicates
            commune_key = (commune_name, district.district_id)

            # Check if commune already prepared or in DB
            if not any(c.commune_name == commune_name and c.district_id == district.district_id for c in communes):
                existing_commune = session.exec(
                    select(Commune).where(
                        Commune.commune_name == commune_name,
                        Commune.district_id == district.district_id
                    )
                ).first()

                if not existing_commune:
                    commune = Commune(
                        commune_name=commune_name,
                        district_id=district.district_id
                    )
                    communes.append(commune)
                else:
                    logger.info(
                        f"Commune '{commune_name}' already exists under district ID {district.district_id}, skipping.")

            logger.info(
                f"Prepared: {city_name}, {district_name}, {commune_name}")

        session.add_all(communes)

    # Create Admin User
    admin_email = settings.FIRST_SUPERUSER
    admin_password = settings.FIRST_SUPERUSER_PASSWORD
    admin_user = session.exec(
        select(User).filter_by(email=admin_email)).first()

    if not admin_user:
        hashed_password = get_password_hash(admin_password)
        admin_user = User(
            email=admin_email,
            hashed_password=hashed_password,
            is_superuser=True,
            name="Admin",
            role="admin",
            is_email_verified=True,
            is_approved=True,
            is_active=True
        )
        session.add(admin_user)
        logger.info(f"Admin user with email {admin_email} created.")

    # BEGIN SAMPLE DATA

    # Initialize Users
    users = [
        User(name="Sokha Meas", email="sokha.meas@example.com", phone="+85512345678", hashed_password=get_password_hash("password123"), role=UserRole.customer, is_email_verified=True, is_active=True, created_at=datetime.now(timezone.utc)),
        User(name="Chantha Kim", email="chantha.kim@example.com", phone="+85598765432", hashed_password=get_password_hash("password123"), role=UserRole.property_owner, is_email_verified=True, is_approved=True, is_active=True, id_card_url="https://example.com/id_cards/chantha_kim.jpg", created_at=datetime.now(timezone.utc)),
        User(name="Rathana Sovann", email="rathana.sovann@example.com", phone="+85591234567", hashed_password=get_password_hash("password123"), role=UserRole.customer, is_email_verified=True, is_active=True, created_at=datetime.now(timezone.utc)),
        User(name="Srey Pov", email="srey.pov@example.com", phone="+85587654321", hashed_password=get_password_hash("password123"), role=UserRole.property_owner, is_email_verified=True, is_approved=True, is_active=True, id_card_url="https://example.com/id_cards/srey_pov.jpg", created_at=datetime.now(timezone.utc)),
        User(name="Vannak Chea", email="vannak.chea@example.com", phone="+85576543210", hashed_password=get_password_hash("password123"), role=UserRole.customer, is_email_verified=True, is_active=True, created_at=datetime.now(timezone.utc)),
        User(name="Sophea Lim", email="sophea.lim@example.com", phone="+85512398765", hashed_password=get_password_hash("password123"), role=UserRole.customer, is_email_verified=True, is_active=True, created_at=datetime.now(timezone.utc)),
        User(name="Dara Seng", email="dara.seng@example.com", phone="+85523456789", hashed_password=get_password_hash("password123"), role=UserRole.property_owner, is_email_verified=True, is_approved=True, is_active=True, id_card_url="https://example.com/id_cards/dara_seng.jpg", created_at=datetime.now(timezone.utc)),
        User(name="Maly Noun", email="maly.noun@example.com", phone="+85534567890", hashed_password=get_password_hash("password123"), role=UserRole.customer, is_email_verified=True, is_active=True, created_at=datetime.now(timezone.utc)),
        User(name="Rithy Phon", email="rithy.phon@example.com", phone="+85545678901", hashed_password=get_password_hash("password123"), role=UserRole.customer, is_email_verified=True, is_active=True, created_at=datetime.now(timezone.utc)),
        User(name="Sokunthea Chhay", email="sokunthea.chhay@example.com", phone="+85556789012", hashed_password=get_password_hash("password123"), role=UserRole.property_owner, is_email_verified=True, is_approved=True, is_active=True, id_card_url="https://example.com/id_cards/sokunthea_chhay.jpg", created_at=datetime.now(timezone.utc)),
        User(name="Vuthy Sok", email="vuthy.sok@example.com", phone="+85567890123", hashed_password=get_password_hash("password123"), role=UserRole.customer, is_email_verified=True, is_active=True, created_at=datetime.now(timezone.utc)),
        User(name="Sreylin Mao", email="sreylin.mao@example.com", phone="+85578901234", hashed_password=get_password_hash("password123"), role=UserRole.customer, is_email_verified=True, is_active=True, created_at=datetime.now(timezone.utc)),
        User(name="Chhay Leang", email="chhay.leang@example.com", phone="+85589012345", hashed_password=get_password_hash("password123"), role=UserRole.property_owner, is_email_verified=True, is_approved=True, is_active=True, id_card_url="https://example.com/id_cards/chhay_leang.jpg", created_at=datetime.now(timezone.utc)),
        User(name="Sokhom Vong", email="sokhom.vong@example.com", phone="+85590123456", hashed_password=get_password_hash("password123"), role=UserRole.customer, is_email_verified=True, is_active=True, created_at=datetime.now(timezone.utc)),
        User(name="Thida Sam", email="thida.sam@example.com", phone="+85512344321", hashed_password=get_password_hash("password123"), role=UserRole.customer, is_email_verified=True, is_active=True, created_at=datetime.now(timezone.utc)),
        User(name="Borey Keo", email="borey.keo@example.com", phone="+85523455432", hashed_password=get_password_hash("password123"), role=UserRole.property_owner, is_email_verified=True, is_approved=True, is_active=True, id_card_url="https://example.com/id_cards/borey_keo.jpg", created_at=datetime.now(timezone.utc)),
        User(name="Sreyneang Ouk", email="sreyneang.ouk@example.com", phone="+85534566543", hashed_password=get_password_hash("password123"), role=UserRole.customer, is_email_verified=True, is_active=True, created_at=datetime.now(timezone.utc)),
        User(name="Vannara Tep", email="vannara.tep@example.com", phone="+85545677654", hashed_password=get_password_hash("password123"), role=UserRole.customer, is_email_verified=True, is_active=True, created_at=datetime.now(timezone.utc)),
        User(name="Pich Sopheak", email="pich.sopheak@example.com", phone="+85556788765", hashed_password=get_password_hash("password123"), role=UserRole.property_owner, is_email_verified=True, is_approved=True, is_active=True, id_card_url="https://example.com/id_cards/pich_sopheak.jpg", created_at=datetime.now(timezone.utc)),
        User(name="Chenda Nguon", email="chenda.nguon@example.com", phone="+85567899876", hashed_password=get_password_hash("password123"), role=UserRole.customer, is_email_verified=True, is_active=True, created_at=datetime.now(timezone.utc)),
    ]
    session.add_all(users)
    session.flush()  # Assign user IDs

    # Define districts and communes for Phnom Penh (city_id=21)
    districts = [
        {"district_id": 87, "district_name": "Chamkar Mon"},
        {"district_id": 118, "district_name": "Chbar Ampov"},
        {"district_id": 58, "district_name": "Chraoy Chongvar"},
        {"district_id": 122, "district_name": "Dangkao"},
        {"district_id": 95, "district_name": "Doun Penh"},
        {"district_id": 99, "district_name": "Mean Chey"},
        {"district_id": 180, "district_name": "Praek Pnov"},
        {"district_id": 93, "district_name": "Prampir Meakkakra"},
        {"district_id": 96, "district_name": "Pur SenChey"},
        {"district_id": 144, "district_name": "Russey Keo"},
        {"district_id": 176, "district_name": "Saensokh"},
        {"district_id": 85, "district_name": "Tuol Kouk"},
    ]
    communes_by_district = {
        58: [
            {"commune_id": 68, "commune_name": "Bak Kaeng"},
            {"commune_id": 294, "commune_name": "Chrouy Changvar"},
            {"commune_id": 467, "commune_name": "Kaoh Dach"},
            {"commune_id": 951, "commune_name": "Preaek Lieb"},
            {"commune_id": 973, "commune_name": "Preaek Ta Sek"},
        ],
        85: [
            {"commune_id": 115, "commune_name": "Boeng Kak Ti Muoy"},
            {"commune_id": 116, "commune_name": "Boeng Kak Ti Pir"},
            {"commune_id": 139, "commune_name": "Boeng Salang"},
            {"commune_id": 845, "commune_name": "Phsar Daeum Kor"},
            {"commune_id": 847, "commune_name": "Phsar Depou Ti Bei"},
            {"commune_id": 848, "commune_name": "Phsar Depou Ti Muoy"},
            {"commune_id": 849, "commune_name": "Phsar Depou Ti Pir"},
            {"commune_id": 1567, "commune_name": "Tuek L'ak Ti Bei"},
            {"commune_id": 1568, "commune_name": "Tuek L'ak Ti Muoy"},
            {"commune_id": 1569, "commune_name": "Tuek L'ak Ti Pir"},
        ],
    }

    # Initialize Properties
    properties = []
    descriptions = [
        "Luxurious {category} in {district} with stunning city views and modern amenities.",
        "Cozy {category} perfect for young professionals in the bustling {district} area.",
        "Spacious {category} ideal for families, located in the heart of {district}.",
        "Affordable {category} in {district}, great for students or budget-conscious renters.",
        "Modern {category} with high-speed internet and proximity to {district} markets.",
        "Charming {category} in {district}, blending traditional style with contemporary comfort.",
        "Elegant {category} in a quiet {district} neighborhood, perfect for relaxation.",
        "Vibrant {category} near {district}'s nightlife, ideal for social butterflies.",
        "Family-friendly {category} in {district} with access to top schools and parks.",
        "Sleek {category} in {district}, designed for urban professionals seeking convenience.",
        "Bright and airy {category} with large windows, located in vibrant {district}.",
        "Budget-friendly {category} in {district}, close to public transport and shops.",
        "Stylish {category} with rooftop access in the trendy {district} area.",
        "Tranquil {category} in {district}, offering a peaceful retreat from city life.",
        "Spacious {category} in {district} with a private balcony and modern fittings.",
        "Newly renovated {category} in {district}, perfect for those seeking a fresh start.",
        "Compact {category} in {district}, ideal for solo travelers or minimalists.",
        "Upscale {category} in {district} with premium appliances and luxury finishes.",
        "Traditional {category} in {district}, infused with local charm and culture.",
        "Convenient {category} near {district}'s business district, great for commuters.",
        "Eco-friendly {category} in {district} with energy-efficient features.",
        "Roomy {category} in {district}, perfect for hosting guests or family gatherings.",
        "Trendy {category} in {district} with easy access to cafes and cultural spots.",
        "Pet-friendly {category} in {district}, ideal for animal lovers.",
        "Modern {category} in {district} with a dedicated workspace for remote professionals.",
        "Affordable {category} in {district}, close to local markets and dining options.",
        "Luxury {category} in {district} with a private garden for outdoor enthusiasts.",
        "Cozy {category} in {district}, perfect for couples or small families.",
        "Contemporary {category} in {district} with smart home features and security.",
        "Spacious {category} in {district}, ideal for creative types with open layouts.",
    ]
    for i in range(50):
        owner = random.choice([u for u in users if u.role == UserRole.property_owner])
        category = session.exec(select(PropertyCategory).where(
            PropertyCategory.category_name == random.choice(["House", "Apartment", "Room"]))).first()
        district = random.choice(districts)
        description_template = random.choice(descriptions)
        property = Property(
            user_id=owner.user_id,
            category_id=category.category_id,
            title=f"{category.category_name} in {district['district_name']}",
            description=description_template.format(category=category.category_name.lower(), district=district['district_name']),
            bedrooms=random.randint(1, 5),
            bathrooms=random.randint(1, 4),
            land_area=Decimal(str(round(random.uniform(40, 300), 2))),
            floor_area=Decimal(str(round(random.uniform(30, 250), 2))),
            status=random.choice([PropertyStatusEnum.available, PropertyStatusEnum.rented]),
            listed_at=datetime.now(timezone.utc) - timedelta(days=random.randint(1, 60)),
            updated_at=datetime.now(timezone.utc),
        )
        properties.append(property)
    session.add_all(properties)
    session.flush()  # Assign property IDs

    # Initialize Property Locations
    phnom_penh = session.exec(select(City).where(City.city_id == 21)).first()
    for property in properties:
        district = random.choice(districts)
        district_id = district["district_id"]
        commune = random.choice(communes_by_district.get(district_id, communes_by_district[58]))
        location = PropertyLocation(
            property_id=property.property_id,
            city_id=phnom_penh.city_id,
            district_id=district_id,
            commune_id=commune["commune_id"],
            street_number=f"Street {random.randint(1, 200)}",
            latitude=Decimal(str(round(random.uniform(11.5, 11.6), 6))),
            longitude=Decimal(str(round(random.uniform(104.8, 104.95), 6))),
        )
        session.add(location)

    # Initialize Property Pricing
    for property in properties:
        pricing = PropertyPricing(
            property_id=property.property_id,
            rent_price=Decimal(str(round(random.uniform(150, 2000), 2))),
            electricity_price=Decimal(str(round(random.uniform(0.1, 0.4), 2))),
            water_price=Decimal(str(round(random.uniform(0.05, 0.25), 2))),
            other_price=Decimal(str(round(random.uniform(5, 75), 2))),
            available_from=date.today() + timedelta(days=random.randint(0, 45)),
        )
        session.add(pricing)

    # Initialize Property Media
    for property in properties:
        for i in range(random.randint(3, 6)):
            media = PropertyMedia(
                property_id=property.property_id,
                media_url=f"https://example.com/property_images/{property.property_id}_{i}.jpg",
                media_type=MediaType.image,
            )
            session.add(media)

    # Initialize Reviews
    review_comments = [
        "Amazing {category}! Spacious and well-maintained.",
        "Really enjoyed staying here, great location in {district}.",
        "Comfortable {category} with all necessary amenities.",
        "Perfect for my needs, highly recommend this {category}!",
        "Great value for money, {district} is a fantastic area.",
    ]
    for property in properties:
        for _ in range(random.randint(2, 5)):
            reviewer = random.choice([u for u in users if u.role == UserRole.customer])
            comment_template = random.choice(review_comments)
            review = Review(
                user_id=reviewer.user_id,
                property_id=property.property_id,
                rating=random.randint(3, 5),
                comment=comment_template.format(category=property.property_category.category_name.lower(), district=districts[random.randint(0, len(districts)-1)]['district_name']),
                status=ReviewStatusEnum.approved,
                created_at=datetime.now(timezone.utc) - timedelta(days=random.randint(1, 30)),
            )
            session.add(review)

    # Initialize Viewing Requests
    for property in properties:
        for _ in range(random.randint(1, 4)):
            requester = random.choice([u for u in users if u.role == UserRole.customer])
            viewing = ViewingRequest(
                user_id=requester.user_id,
                property_id=property.property_id,
                requested_time=datetime.now(timezone.utc) + timedelta(days=random.randint(1, 10)),
                status=random.choice([ViewingRequestStatusEnum.pending, ViewingRequestStatusEnum.accepted, ViewingRequestStatusEnum.denied]),
                created_at=datetime.now(timezone.utc) - timedelta(days=random.randint(0, 15)),
            )
            session.add(viewing)

    # Initialize Wishlist Items
    for user in [u for u in users if u.role == UserRole.customer]:
        selected_property_ids = set()
        for _ in range(random.randint(2, 5)):
            # Choose a property not already in the wishlist for this user
            available_properties = [p for p in properties if p.property_id not in selected_property_ids]
            if not available_properties:
                break  # No more unique properties available
            property = random.choice(available_properties)
            selected_property_ids.add(property.property_id)

            wishlist = WishList(
                user_id=user.user_id,
                property_id=property.property_id,
                added_at=datetime.now(timezone.utc) - timedelta(days=random.randint(1, 30)),
            )
            session.add(wishlist)
    # END SAMPLE DATA

    try:
        session.commit()
        logger.info("Data and admin user successfully inserted into the database!")
    except IntegrityError as e:
        session.rollback()
        logger.error("Error inserting data:", e)'''