from pathlib import Path
import sys

sys.path.append(str(Path(__file__).resolve().parents[1]))

from app.db import SessionLocal, init_db
from app.models import TrainingData
from app.shared_training import merge_shared_training_data


def main() -> None:
    init_db()
    db = SessionLocal()
    try:
        rows = db.query(TrainingData).all()
        for row in rows:
            row.data = merge_shared_training_data(row.data or {})
            db.add(row)
        db.commit()
        print(f"Updated training_data rows: {len(rows)}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
