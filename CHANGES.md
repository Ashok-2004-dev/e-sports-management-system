# Modifications

- Join Team button on the Teams and Team pages (player login).
- Tournament pages and cards show your registration status: pending, approved or rejected.
- Player limit per team for each game (PUBG Mobile 4, Free Fire 4, Mobile Legends 5, Valorant 5, eFootball 1). Admin can change it under Games.
- A team belongs to one game. Team games need a team of that game before registering.
- Leaderboard: top 10 teams or players, filtered by game or all games.
- LIVE buttons appear only while the admin has a match live with a stream link (Admin > Matches > Go live).
- Darker theme, dark / light switch, two fonts (Rajdhani and Inter), "Back" button.
- Google and Facebook login (needs your own keys, see below).

## After updating an existing database
1. Start the backend once. It adds `games.team_size` and `teams.game_id` by itself.
2. Admin > Teams: edit each old team and choose its game.
3. Admin > Games: check the players per team.
4. Admin > Matches: take old sample matches off the live list (open "Live", untick "live now", save).

## Google login
1. In Google Cloud Console create an OAuth client ID of type "Web application".
2. Add Authorized JavaScript origins: `http://localhost` and `http://localhost:5173`.
3. Put the client ID in `backend/.env` as `GOOGLE_CLIENT_ID` and in `frontend/.env` as `VITE_GOOGLE_CLIENT_ID`.

## Facebook login
1. At developers.facebook.com create an app with Facebook Login, and keep it in Development mode for localhost.
2. Allow the `email` permission.
3. `backend/.env`: `FACEBOOK_APP_ID` and `FACEBOOK_APP_SECRET`. `frontend/.env`: `VITE_FACEBOOK_APP_ID`.
4. In Development mode only people added to the app (admins, developers, testers) can log in.
5. A deployed site must use HTTPS.

Restart both servers after editing `.env`. Never push `.env` to GitHub.
