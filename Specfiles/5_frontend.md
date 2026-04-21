# Frontend Specification

## 1. Overview

The frontend is a React-based web dashboard for the Temple University College of Engineering, door-usage monitoring project.

Its purpose is to display live data collected from door sensors installed at the building entrances. The interface allows users to compare doors, view usage trends, inspect recent events, and understand how the system works.

This frontend serves as the user-facing layer of the project and connects the backend API to the final visual dashboard.

## 2. Frontend Architecture

The frontend is implemented as a single-page React application.

### Core Characteristics
- Built with React functional components
- Uses React hooks for state and lifecycle logic
- Uses `fetch()` to retrieve backend data
- Uses `Chart.js` for the main dashboard line chart
- Uses inline style objects for layout and visual design
- Uses sidebar-based page switching instead of route-based navigation

### Main Frontend Behavior
- Fetches live data from `/api/data`
- Refreshes automatically every 3 seconds
- Stores API data in React state
- Processes raw API data into grouped statistics for visualization
- Renders different page views based on the currently selected sidebar item

## 3. Main Pages / Views

The application contains five main views selectable from the sidebar. :contentReference[oaicite:1]{index=1}

### 3.1 Dashboard
The Dashboard is the main landing page.

#### Purpose
Show a quick summary of current system activity and general door usage trends.

#### Features
- Door summary cards for up to 3 doors
- Total usage count per displayed door
- Peak hour usage per displayed door
- Latest event time per displayed door
- Line chart showing door usage over time
- Live API status indicator
- Error banner when live data fails to load

### 3.2 Door Info
The Door Info page focuses on per-door comparison and rankings.

#### Features
- Ranked list of doors by total event count
- Horizontal usage-share comparison graph
- Individual info cards for each door
- Per-door mini hourly bar graph
- Total count and latest timestamp for each door

### 3.3 Analytics
The Analytics page focuses on aggregate trends.

#### Features
- Grouped hourly comparison bars by door
- Total traffic by hour horizontal graph
- Comparison of usage patterns across all hours found in the dataset

### 3.4 Recent Events
The Recent Events page shows the latest raw door activity.

#### Features
- Displays the 15 most recent events
- Shows door/device name
- Shows formatted timestamp for each event

### 3.5 About
The About page explains the project and how it works.

#### Features
- Project overview
- Reason for choosing the project
- Concept exploration section
- Hardware-to-dashboard data flow explanation
- Repository link
- Acknowledgement / thanks section

## 4. Navigation System

The application uses a left sidebar for page navigation rather than React Router. :contentReference[oaicite:2]{index=2}

### Sidebar Items
- Dashboard
- Door Info
- Analytics
- Recent Events
- About

### Navigation Behavior
- Clicking a sidebar button changes the `activePage` state
- The selected page button is visually highlighted
- The selected page is conditionally rendered in the main content area

## 5. State Management

The frontend uses React local state only.

### Main State Variables
- `apiData`: stores backend response data
- `loading`: tracks whether data is still being loaded
- `errorText`: stores API failure message text
- `activePage`: tracks which page is currently selected

### Additional Derived Data
The application uses `useMemo()` to compute processed values from raw API data, including:
- grouped door statistics
- total number of events
- total number of doors
- busiest door
- ranked door list
- hourly labels
- per-door hourly counts
- total hourly traffic rows
- chart-ready datasets

## 6. Backend Data Contract

The frontend expects the backend endpoint:

```text
GET /api/data