from datetime import datetime, timezone


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def create_initial_training_data() -> dict:
    timestamp = now_iso()
    return {
        "exercises": [
            {
                "id": "exercise-bench-press",
                "name": "Жим лежа",
                "muscleGroup": "Грудь",
                "type": "strength",
                "description": "Контролируйте опускание штанги, держите лопатки сведенными.",
                "isActive": True,
                "createdAt": timestamp,
                "updatedAt": timestamp,
            },
            {
                "id": "exercise-squat",
                "name": "Присед",
                "muscleGroup": "Ноги",
                "type": "strength",
                "description": "Сохраняйте нейтральную спину и устойчивую стопу.",
                "isActive": True,
                "createdAt": timestamp,
                "updatedAt": timestamp,
            },
            {
                "id": "exercise-deadlift",
                "name": "Становая тяга",
                "muscleGroup": "Спина",
                "type": "strength",
                "description": "Начинайте движение ногами, держите гриф близко к корпусу.",
                "isActive": True,
                "createdAt": timestamp,
                "updatedAt": timestamp,
            },
            {
                "id": "exercise-pullups",
                "name": "Подтягивания",
                "muscleGroup": "Спина",
                "type": "strength",
                "description": "Работайте в полной амплитуде без рывков.",
                "isActive": True,
                "createdAt": timestamp,
                "updatedAt": timestamp,
            },
            {
                "id": "exercise-leg-press",
                "name": "Жим ногами",
                "muscleGroup": "Ноги",
                "type": "strength",
                "description": "Не блокируйте колени в верхней точке.",
                "isActive": True,
                "createdAt": timestamp,
                "updatedAt": timestamp,
            },
        ],
        "programs": [],
        "sessions": [],
    }
