import Thread from "../models/Thread.js";

// Get all threads of the logged-in user
export const getThreads = async (req, res) => {
  try {
    const threads = await Thread.find({
      userId: req.userId,
    }).sort({
      updatedAt: -1,
    });

    return res.status(200).json(threads);
  } catch (error) {
    console.error("Get threads error:", error.message);

    return res.status(500).json({
      error: "Failed to fetch threads.",
    });
  }
};

// Get messages of a specific thread
export const getThreadById = async (req, res) => {
  const { threadId } = req.params;

  if (!threadId) {
    return res.status(400).json({
      error: "Thread ID is required.",
    });
  }

  try {
    const thread = await Thread.findOne({
      threadId,
      userId: req.userId,
    });

    if (!thread) {
      return res.status(404).json({
        error: "Thread not found.",
      });
    }

    return res.status(200).json(thread.messages);
  } catch (error) {
    console.error("Get thread error:", error.message);

    return res.status(500).json({
      error: "Failed to load conversation.",
    });
  }
};

// Delete a specific thread
export const deleteThread = async (req, res) => {
  const { threadId } = req.params;

  if (!threadId) {
    return res.status(400).json({
      error: "Thread ID is required.",
    });
  }

  try {
    const deletedThread = await Thread.findOneAndDelete({
      threadId,
      userId: req.userId,
    });

    if (!deletedThread) {
      return res.status(404).json({
        error: "Thread not found.",
      });
    }

    return res.status(200).json({
      message: "Thread deleted successfully.",
    });
  } catch (error) {
    console.error("Delete thread error:", error.message);

    return res.status(500).json({
      error: "Failed to delete thread.",
    });
  }
};