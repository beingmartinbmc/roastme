const simpleGit = require('simple-git');
const path = require('path');
const fs = require('fs-extra');

let git = null;

function getGitInstance() {
  if (!git) {
    git = simpleGit();
  }
  return git;
}

async function getGitInfo() {
  try {
    const gitInstance = getGitInstance();
    
    // Check if we're in a git repository
    const isRepo = await gitInstance.checkIsRepo();
    if (!isRepo) {
      return null;
    }
    
    // Get the latest commit info
    const log = await gitInstance.log({ maxCount: 1 });
    if (!log.latest) {
      return null;
    }
    
    const commit = log.latest;
    
    // Get the diff for this commit
    let diff = '';
    try {
      diff = await gitInstance.diff(['HEAD~1', 'HEAD']);
    } catch (error) {
      // If there's no previous commit, get diff from empty tree
      try {
        diff = await gitInstance.diff(['4b825dc642cb6eb9a060e54bf8d69288fbee4904', 'HEAD']);
      } catch (diffError) {
        // If that fails too, just skip the diff
        diff = '';
      }
    }
    
    return {
      hash: commit.hash.substring(0, 8),
      message: commit.message.trim(),
      author: commit.author_name,
      date: commit.date,
      diff: diff
    };
    
  } catch (error) {
    console.error('Error getting git info:', error.message);
    return null;
  }
}

async function getStagedChanges() {
  try {
    const gitInstance = getGitInstance();
    
    // Check if we're in a git repository
    const isRepo = await gitInstance.checkIsRepo();
    if (!isRepo) {
      return null;
    }
    
    // Get staged files
    const status = await gitInstance.status();
    const stagedFiles = status.staged;
    
    if (!stagedFiles || stagedFiles.length === 0) {
      return [];
    }
    
    // Get the diff for staged changes
    const diff = await gitInstance.diff(['--cached']);
    
    // Return file paths that are staged
    return stagedFiles.map(file => file);
    
  } catch (error) {
    console.error('Error getting staged changes:', error.message);
    return null;
  }
}

async function getStagedDiff() {
  try {
    const gitInstance = getGitInstance();
    return await gitInstance.diff(['--cached']);
  } catch (error) {
    console.error('Error getting staged diff:', error.message);
    return '';
  }
}

async function isGitRepository() {
  try {
    const gitInstance = getGitInstance();
    return await gitInstance.checkIsRepo();
  } catch (error) {
    return false;
  }
}

module.exports = {
  getGitInfo,
  getStagedChanges,
  getStagedDiff,
  isGitRepository
};
