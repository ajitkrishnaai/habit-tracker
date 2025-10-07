# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Purpose

This is the AI Dev Tasks repository - a collection of structured markdown files designed to guide AI assistants through systematic feature development workflows. The repository contains prompt templates that help break down complex development tasks into manageable, step-by-step processes.

## Core Workflow Files

The repository contains three main workflow files that work together:

### 1. create-prd.md
- **Purpose**: Guides AI in creating Product Requirement Documents (PRDs)
- **Usage**: Reference when user wants to create a structured PRD for a new feature
- **Output**: Saves PRD as `[n]-prd-[feature-name].md` in `/tasks` directory
- **Process**: Ask clarifying questions first, then generate comprehensive PRD

### 2. generate-tasks.md
- **Purpose**: Converts PRDs into detailed, actionable task lists
- **Usage**: Reference after a PRD is created to break it down into implementation steps
- **Output**: Saves as `tasks-[prd-file-name].md` in `/tasks` directory
- **Process**: Two-phase approach - generate parent tasks first, wait for "Go" confirmation, then add sub-tasks

### 3. process-task-list.md
- **Purpose**: Manages task execution with built-in review checkpoints
- **Usage**: Reference when starting task implementation to ensure systematic progress
- **Process**: Complete one sub-task at a time, wait for user approval before proceeding to next task

## Workflow Architecture

The files implement a three-stage development process:

1. **Planning Stage** (create-prd.md): Transform vague feature ideas into detailed requirements
2. **Task Generation** (generate-tasks.md): Break requirements into specific, actionable development tasks
3. **Implementation Stage** (process-task-list.md): Execute tasks systematically with review gates

## File Organization

- Root directory contains the three workflow markdown files
- `/tasks` directory (created as needed) stores generated PRDs and task lists
- No build system, package management, or testing framework - this is a documentation-only repository

## Key Principles

- **Structured Approach**: Each file enforces a specific methodology to prevent scope creep
- **Junior Developer Focused**: All outputs assume the reader is a junior developer needing explicit guidance
- **Review Gates**: Built-in checkpoints ensure quality control throughout the process
- **Tool Agnostic**: Designed to work with any AI coding assistant (Cursor, Claude Code, etc.)

## Usage Pattern

When a user requests structured feature development:
1. Start with create-prd.md to define requirements
2. Use generate-tasks.md to create implementation plan
3. Follow process-task-list.md for systematic execution

The workflow is designed to replace ad-hoc, monolithic AI requests with a systematic, reviewable development process.