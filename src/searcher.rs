pub enum TerrainCell {
    Obstacle,
    Sand,
    Mud,
    Water,
    Generic { cost: i32 },
}

impl TerrainCell {
    pub fn cost(&self) -> Option<i32> {
        use TerrainCell::*;

        match self {
            Obstacle => None,
            Sand => Some(1),
            Mud => Some(5),
            Water => Some(10),
            Generic { cost } => Some(*cost),
        }
    }
}

trait AgentSearcher {
    fn step(&mut self) -> Option<()>;
}
