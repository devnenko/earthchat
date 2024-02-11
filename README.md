# EarthChat
Run "npm install" in main and src folder separately and youre ready to go

### Commands
- "npm start" => Start production server
- "npm run build" => Build website for production
- "npm run dev" => Start development server and listen for file updates


### Docker Commands (For pushing to Google Cloud Run)
- "docker buildx build --platform linux/amd64 ."
- "docker tag (enter project id here) gcr.io/earthchat/earth-chat"
- "docker push gcr.io/earthchat/earth-chat"