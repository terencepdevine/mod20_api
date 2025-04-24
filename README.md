# MOD20 API

The backend API for **MOD20** — a fully customizable tabletop RPG system. This is where the magic happens behind the scenes. It powers the content management for everything from Races and Roles to Items, Attacks, and entire game Systems.

Built with **Express.js** and **MongoDB**, this API gives game creators the tools to define how their world works, what characters can do, and the rules that shape their universe.

## What is MOD20?

MOD20 is a modular, system-agnostic TTRPG engine that draws inspiration from D&D 5e but is designed to be customized. Want a fantasy setting? Sci-fi horror? Noir detective work? This system should make it easy to swap content and tweak mechanics without rewriting everything from scratch.

## What's here

This API supports:

- Creating and managing custom **Systems**
- Defining **Races**, **Roles**, **Items**, **Attacks**, etc.
- Admin routes for editing content
- Public endpoints for retrieving content per system

## Tech Stack

- **Express.js** (Node)
- **MongoDB** (via Mongoose)
- **TypeScript** (in progress)
- Uses the shared types from [`@mod20/types`](https://www.npmjs.com/package/@mod20/types)
