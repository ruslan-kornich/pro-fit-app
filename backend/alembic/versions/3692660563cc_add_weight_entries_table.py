"""add_weight_entries_table

Revision ID: 3692660563cc
Revises: 32e41aae7257
Create Date: 2026-01-24 15:34:57.962549

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = '3692660563cc'
down_revision: Union[str, None] = '32e41aae7257'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'weight_entries',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('user_id', sa.UUID(), nullable=False),
        sa.Column('weight', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('recorded_date', sa.Date(), nullable=False),
        sa.Column('note', sa.String(length=500), nullable=True),
        sa.Column('created_at', postgresql.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', postgresql.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_weight_entries_user_id', 'weight_entries', ['user_id'], unique=False)
    op.create_index('ix_weight_entries_recorded_date', 'weight_entries', ['recorded_date'], unique=False)
    op.create_index('ix_weight_entries_user_date', 'weight_entries', ['user_id', 'recorded_date'], unique=True)


def downgrade() -> None:
    op.drop_index('ix_weight_entries_user_date', table_name='weight_entries')
    op.drop_index('ix_weight_entries_recorded_date', table_name='weight_entries')
    op.drop_index('ix_weight_entries_user_id', table_name='weight_entries')
    op.drop_table('weight_entries')
