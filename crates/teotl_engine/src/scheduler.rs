//! Task scheduler for deferred/timed actions

use std::collections::VecDeque;

/// Scheduled task
#[derive(Debug)]
pub struct ScheduledTask {
    pub execute_at: f32,
    pub name: String,
}

/// Simple task scheduler
#[derive(Debug)]
pub struct Scheduler {
    tasks: VecDeque<ScheduledTask>,
}

impl Scheduler {
    pub fn new() -> Self {
        Self {
            tasks: VecDeque::new(),
        }
    }

    /// Schedule a task to run at specific time
    pub fn schedule(&mut self, name: String, execute_at: f32) {
        let new_task = ScheduledTask { execute_at, name };

        // Insert the new task so that `tasks` remains sorted by `execute_at` (earliest first).
        let insert_pos = self
            .tasks
            .iter()
            .position(|task| task.execute_at > new_task.execute_at)
            .unwrap_or(self.tasks.len());

        self.tasks.insert(insert_pos, new_task);
    }

    /// Update scheduler and execute due tasks
    pub fn update(&mut self, current_time: f32) -> Vec<String> {
        let mut executed = Vec::new();

        while let Some(task) = self.tasks.front() {
            if task.execute_at <= current_time {
                let task = self.tasks.pop_front().unwrap();
                executed.push(task.name);
            } else {
                break;
            }
        }

        executed
    }

    /// Clear all scheduled tasks
    pub fn clear(&mut self) {
        self.tasks.clear();
    }
}

impl Default for Scheduler {
    fn default() -> Self {
        Self::new()
    }
}
