import uuid

# In-memory store (TEMP)
RIG_DB = {}


def create_rig(data: dict):
    rig_id = str(uuid.uuid4())
    RIG_DB[rig_id] = data
    return rig_id


def get_rig(rig_id: str):
    return RIG_DB.get(rig_id)


def list_rigs():
    return RIG_DB