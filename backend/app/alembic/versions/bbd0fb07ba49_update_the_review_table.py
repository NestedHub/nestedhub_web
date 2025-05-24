"""update the review table

Revision ID: bbd0fb07ba49
Revises: c2683f3d9c99
Create Date: 2025-04-29 01:28:15.706748

"""
from alembic import op
import sqlalchemy as sa
import sqlalchemy.dialects.postgresql as psql

# revision identifiers, used by Alembic.
revision = 'bbd0fb07ba49'
down_revision = 'c2683f3d9c99'
branch_labels = None
depends_on = None


def upgrade():
    # 1. Create the ENUM type first
    review_status_enum = psql.ENUM('pending', 'approved', 'rejected', name='reviewstatusenum')
    review_status_enum.create(op.get_bind())

    # 2. Then add the new column using the enum
    op.add_column('review', sa.Column('status', sa.Enum('pending', 'approved', 'rejected', name='reviewstatusenum'), nullable=False))


def downgrade():
    # 1. Drop the column first
    op.drop_column('review', 'status')

    # 2. Then drop the ENUM type
    review_status_enum = psql.ENUM('pending', 'approved', 'rejected', name='reviewstatusenum')
    review_status_enum.drop(op.get_bind())
