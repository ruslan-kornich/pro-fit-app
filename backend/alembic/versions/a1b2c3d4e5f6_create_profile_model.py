"""create profile model

Revision ID: a1b2c3d4e5f6
Revises: e36099ed42f3
Create Date: 2026-01-19 17:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, None] = 'e36099ed42f3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'profiles',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=True),
        sa.Column('height', sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column('weight', sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column('age', sa.Integer(), nullable=True),
        sa.Column('gender', sa.String(length=20), nullable=True),
        sa.Column('activity_level', sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column('language', sa.String(length=10), nullable=False, server_default='uk'),
        sa.Column('goal', sa.String(length=20), nullable=False, server_default='maintain'),
        sa.Column('daily_calorie_norm', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    )
    op.create_index('ix_profiles_user_id', 'profiles', ['user_id'], unique=True)

    op.execute("""
        INSERT INTO profiles (id, user_id, name, height, weight, age, gender, activity_level, daily_calorie_norm, created_at, updated_at)
        SELECT gen_random_uuid(), id, name, height, weight, age, gender, activity_level, daily_calorie_norm, created_at, updated_at
        FROM users
    """)

    op.drop_column('users', 'name')
    op.drop_column('users', 'height')
    op.drop_column('users', 'weight')
    op.drop_column('users', 'age')
    op.drop_column('users', 'gender')
    op.drop_column('users', 'activity_level')
    op.drop_column('users', 'daily_calorie_norm')


def downgrade() -> None:
    op.add_column('users', sa.Column('name', sa.String(length=255), nullable=True))
    op.add_column('users', sa.Column('height', sa.Numeric(precision=10, scale=2), nullable=True))
    op.add_column('users', sa.Column('weight', sa.Numeric(precision=10, scale=2), nullable=True))
    op.add_column('users', sa.Column('age', sa.Integer(), nullable=True))
    op.add_column('users', sa.Column('gender', sa.String(length=20), nullable=True))
    op.add_column('users', sa.Column('activity_level', sa.Numeric(precision=10, scale=2), nullable=True))
    op.add_column('users', sa.Column('daily_calorie_norm', sa.Integer(), nullable=True))

    op.execute("""
        UPDATE users u
        SET name = p.name,
            height = p.height,
            weight = p.weight,
            age = p.age,
            gender = p.gender,
            activity_level = p.activity_level,
            daily_calorie_norm = p.daily_calorie_norm
        FROM profiles p
        WHERE p.user_id = u.id
    """)

    op.drop_index('ix_profiles_user_id', table_name='profiles')
    op.drop_table('profiles')
