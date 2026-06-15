from .training_seed import now_iso


SHARED_PROGRAMS = [
    {
        "id": "program-day-1-back-hamstrings-glutes",
        "name": "День 1 — спина + ЗПБ",
        "description": "Спина, задняя поверхность бедра и ягодичные.",
        "items": [
            ("Подтягивания узким", "Спина", "https://youtu.be/S8lfD4Gn0ys?si=kgarAEn3F8X9YCKn", 3, "MAX"),
            ("Тяга горизонтального Хаммера по одной", "Спина", "https://youtu.be/Bl9eLdocw8w?si=5-tUJO8kIC2-qZ5e", 3, "12"),
            ("Тяга верхнего блока широким", "Спина", "https://youtu.be/agwPtE8q6Bs?si=uEOOkGwiKJtwtwRt", 3, "12"),
            ("Пуловер в кроссовере", "Спина", "https://youtu.be/vGKFOdSizbU?si=AJPBBbMWuWPnTqTo", 3, "15"),
            ("Сгибания ног сидя", "Ноги", "https://youtu.be/JypDm2v93Po?si=uXF337lJrmgswf6Q", 4, "15"),
            ("Ягодичный мост в Смитте", "Ягодицы", "https://youtu.be/u1GhHki-fa0?si=112HMdaAm8iWcbqn", 3, "12"),
        ],
    },
    {
        "id": "program-day-2-chest",
        "name": "День 2 — грудь",
        "description": "Грудь, плечи и трицепс.",
        "items": [
            ("Сведения в бабочке", "Грудь", "https://youtu.be/A8fjBI8-F3M?si=arI113eVHwWMMUad", 3, "15/12/10"),
            ("Жим в Смитте под углом 30", "Грудь", "https://youtu.be/2RnKKkRBwUY?si=G4ZAvvm79M2FEOUp", 3, "12/10/8"),
            ("Жим гантелей под углом 15", "Грудь", "https://youtu.be/yODyN-CgQZE?si=M9AH74VQr-s2GYkT", 3, "12/10/8"),
            ("Махи гантелей в стороны сидя", "Плечи", "https://youtu.be/akBoO3-zGXw?si=yIV7DKjJ_QoSQVm6", 4, "15/12/10/8"),
            ("Жим в Смитте сидя", "Плечи", "https://youtu.be/YKGoGmSdtzg?si=UbZwIE_Hllam3k_c", 3, "12/10/8"),
            ("Разгибания на трицепс с изогнутой", "Трицепс", "https://youtu.be/hUYQIf8tTRc?si=zRcTJeyZY3Tb9M93", 4, "12/10/8/6"),
        ],
    },
    {
        "id": "program-day-3-legs",
        "name": "День 3 — ноги",
        "description": "Квадрицепс, бицепс бедра, ягодичные и икры.",
        "items": [
            ("Разгибания ног сидя по одной", "Ноги", "https://youtu.be/LXvfKuRlPyM?si=t_EEcT8Xb2MADO6d", 4, "15"),
            ("Приседания в Смитте", "Ноги", "https://youtu.be/UOM8GcPZUfI?si=trnDaWm110AOSnFl", 3, "12"),
            ("Жим ногами", "Ноги", "https://youtu.be/FB7RQ0MUQfI?si=wGIUQwPkP4_R8oQ0", 3, "12"),
            ("Сгибания ног сидя", "Ноги", "https://youtu.be/JypDm2v93Po?si=nM_oZKv75bDx-s41", 4, "15"),
            ("Румынская тяга", "Ноги", "https://youtu.be/5waHvs_rJ7I?si=UZjl7HCBc2SYKA5C", 3, "12"),
            ("Икры стоя", "Икры", "https://youtu.be/loa9JJPz2PA?si=EOf5MhJ1o0bg14TF", 4, "15"),
        ],
    },
    {
        "id": "program-day-4-back-biceps",
        "name": "День 4 — спина",
        "description": "Спина и бицепс.",
        "items": [
            ("Пуловер в кроссовере", "Спина", "https://youtu.be/vGKFOdSizbU?si=OHtM7ESZ8HIslGkh", 3, "15/12/10"),
            ("Тяга Т-грифа с упором грудью", "Спина", "https://youtu.be/6QrNfeSusB4?si=SDrBYPFzCt3fiiRC", 3, "12/10/8"),
            ("Тяга по одной руке нейтральным хватом", "Спина", "https://youtu.be/9X0NkajKmNk?si=PIMPMLKVhwBn_sf-", 3, "12/10/8"),
            ("Тяга верхнего узким", "Спина", "https://youtu.be/PznPANPouKY?si=pvjYRyNWlJ82BYIT", 3, "12/10/8"),
            ("Сгибания с EZ-грифом", "Бицепс", "https://youtu.be/7gqB_bthlM8?si=aCUG7CNdXC2QiHht", 4, "12/10/8/6"),
            ("Молоты попеременно", "Бицепс", "https://youtu.be/NkQQqJuv8mk?si=Fa35EM3dHYYlGI2S", 4, "12/10/8/6"),
        ],
    },
    {
        "id": "program-day-5-shoulders-chest-triceps",
        "name": "День 5 — плечи / грудь / трицепс",
        "description": "Плечи, грудь и трицепс.",
        "items": [
            ("Отведения по одной на ЗД", "Плечи", "https://youtu.be/Cu4eZyBWWX8?si=NceagEMnVaVmNDNf", 4, "15"),
            ("Махи гантелей в стороны", "Плечи", "https://youtu.be/akBoO3-zGXw?si=N80azZjoQVJwGEem", 4, "15"),
            ("Жим в Смитте сидя", "Плечи", "https://youtu.be/YKGoGmSdtzg?si=UbZwIE_Hllam3k_c", 3, "12"),
            ("Мах по одной в кроссовере", "Плечи", "https://youtu.be/_35p7J_bSpU?si=O7-2Mgta3xa-ale9", 4, "15"),
            ("Сведения в кроссовере книзу", "Грудь", "https://youtu.be/xGaxgb2JlGg?si=H2__fzELRYetTHEr", 3, "15"),
            ("Брусья", "Грудь", "https://youtu.be/FEzj283bV3g?si=-gvCjmz0c6i0I_9j", 4, "MAX"),
            ("Французский с гантелями", "Трицепс", "https://youtu.be/W37dys-Cz_4?si=Z6f44bOIPyYIiNLX", 4, "12"),
        ],
    },
]


def slugify(value: str) -> str:
    replacements = {
        " ": "-",
        "—": "-",
        "/": "-",
        "+": "-",
    }
    result = value.lower()
    for source, target in replacements.items():
        result = result.replace(source, target)
    allowed = "abcdefghijklmnopqrstuvwxyz0123456789-"
    translit = {
        "а": "a", "б": "b", "в": "v", "г": "g", "д": "d", "е": "e", "ё": "e", "ж": "zh", "з": "z",
        "и": "i", "й": "y", "к": "k", "л": "l", "м": "m", "н": "n", "о": "o", "п": "p", "р": "r",
        "с": "s", "т": "t", "у": "u", "ф": "f", "х": "h", "ц": "c", "ч": "ch", "ш": "sh",
        "щ": "sch", "ъ": "", "ы": "y", "ь": "", "э": "e", "ю": "yu", "я": "ya",
    }
    result = "".join(translit.get(char, char) for char in result)
    result = "".join(char if char in allowed else "-" for char in result)
    while "--" in result:
        result = result.replace("--", "-")
    return result.strip("-")


def parse_reps(value: str) -> dict:
    if value.upper() == "MAX":
        return {"plannedRepsText": "MAX", "plannedRepsMax": True}
    first = int(value.split("/")[0])
    return {"plannedReps": first, "plannedRepsText": value}


def create_shared_training_data() -> dict:
    timestamp = now_iso()
    exercises_by_name: dict[str, dict] = {}
    programs = []

    for program in SHARED_PROGRAMS:
        program_exercises = []
        for order, (name, muscle_group, youtube_url, sets, reps) in enumerate(program["items"], start=1):
            exercise_id = f"exercise-{slugify(name)}"
            if name not in exercises_by_name:
                exercises_by_name[name] = {
                    "id": exercise_id,
                    "name": name,
                    "muscleGroup": muscle_group,
                    "type": "strength",
                    "description": "",
                    "youtubeUrl": youtube_url,
                    "isActive": True,
                    "createdAt": timestamp,
                    "updatedAt": timestamp,
                }

            program_exercises.append(
                {
                    "id": f"{program['id']}-exercise-{order}",
                    "exerciseId": exercise_id,
                    "order": order,
                    "plannedSets": sets,
                    **parse_reps(reps),
                }
            )

        programs.append(
            {
                "id": program["id"],
                "name": program["name"],
                "description": program["description"],
                "exercises": program_exercises,
                "createdAt": timestamp,
                "updatedAt": timestamp,
            }
        )

    return {
        "exercises": list(exercises_by_name.values()),
        "programs": programs,
        "sessions": [],
    }


def merge_shared_training_data(data: dict) -> dict:
    shared = create_shared_training_data()
    existing_exercise_ids = {exercise.get("id") for exercise in data.get("exercises", [])}
    existing_program_ids = {program.get("id") for program in data.get("programs", [])}

    return {
        "exercises": [
            *data.get("exercises", []),
            *[exercise for exercise in shared["exercises"] if exercise["id"] not in existing_exercise_ids],
        ],
        "programs": [
            *data.get("programs", []),
            *[program for program in shared["programs"] if program["id"] not in existing_program_ids],
        ],
        "sessions": data.get("sessions", []),
    }
