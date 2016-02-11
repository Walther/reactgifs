# ReactGIFS

React-based image sharing site

![Index page, not logged in](screenshots/2016-02-11-132620_1920x1080_scrot.png)
![Index page, login box](screenshots/2016-02-11-132625_1920x1080_scrot.png)
![Index page, logged in, submit form](screenshots/2016-02-11-132703_1920x1080_scrot.png)
![Gallery page with a submitted image](screenshots/2016-02-11-132731_1920x1080_scrot.png)
![Gallery page with example comment](screenshots/2016-02-11-132812_1920x1080_scrot.png)
## Usage

- `npm install`
- `node server.js`
- Open http://localhost:8080/ in your favourite browser


## TODO:

- [x] Support for uploading an image post with single image
- [x] Support for separate post metadata and image storage
- [x] Support for posting comments on an image post
- [ ] Ensure the API is RESTful
- [ ] Support for submitting multiple images within same post
- [ ] Support for comments of comments; comment-tree
- [ ] Automated testing
- [ ] Continuous integration
- [ ] Improved UX
  - [ ] Most popular images on frontpage
  - [ ] Next / previous post
  - [x] 404 on not data not found
- [ ] User accounts
  - [ ] Post & comment deletion
  - [x] Registration / login
  - [ ] Make sure all providers work
  - [x] Clean up the hash-url after initial login
  - [ ] User profiles
  - [x] Fix login button on gallery pages / not-frontpage
- Thorough analysis & mitigation of possible security vulnerabilities!
  - [x] Primitive filetype checking
