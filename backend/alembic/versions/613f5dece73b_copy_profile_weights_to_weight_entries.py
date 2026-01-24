"""copy_profile_weights_to_weight_entries

Revision ID: 613f5dece73b
Revises: 3692660563cc
Create Date: 2026-01-24

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = '613f5dece73b'
down_revision: Union[str, None] = '3692660563cc'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    connection = op.get_bind()

    connection.execute(sa.text("""
        INSERT INTO weight_entries (id, user_id, weight, recorded_date, note, created_at, updated_at)
        SELECT
            gen_random_uuid(),
            p.user_id,
            p.weight,
            p.created_at::date,
            'Initial weight from profile',
            p.created_at,
            p.updated_at
        FROM profiles p
        WHERE p.weight IS NOT NULL
        AND NOT EXISTS (
            SELECT 1 FROM weight_entries we
            WHERE we.user_id = p.user_id
        )
    """))


def downgrade() -> None:
    connection = op.get_bind()

    connection.execute(sa.text("""
        DELETE FROM weight_entries
        WHERE note = 'Initial weight from profile'
    """))
