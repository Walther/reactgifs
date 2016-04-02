# tsoha-docs

This folder contains documentation required for a course at University of Helsinki.

## Introduction

- ReactGIFs is an image / gif sharing site
- Users of ReactGIFs can:
    - Log in
    - Submit photos
    - Comment on photos
- Further plans include:
    - Favourites
    - Searching for photos
    - Tags / Topic galleries / etc
    - Up/downvoting of photos and comments

## Environment / implementation

- ReactGIFs is based on the following technologies:
    - Node.js - a server-side JavaScript runtime
    - React - a modern JavaScript library for building the client
- Further plans include:
    - PostgreSQL


## User groups & Usecases


**User groups**

- User, not logged in
    - Any user visiting the website, who is not logged in to the service
    - Can browse the website and view content
- User, logged in
    - Any user with registered account on the site
    - Can submit photos
    - Can comment on photos
    - TODO: Can favourite photos
    - TODO: Can up/downvote photos and comments
- Administrator
    - Special users with elevated permissions
    - Can perform maintenance
    - Can remove content
    - Can write announcements

**Usecase diagram**

![reactgifs-usecase.png](reactgifs-usecase.png)

**Usecases**

- Browsing: Any user can view the content on the site
- Submitting photos: A registered user can submit an image through a form
- Commenting on photos: A registered user can submit comments on images
- Favouriting photos: A registered user can favourite images to find them easily in their favourite list
- Up/downvoting: A registered user can vote on images and comments to indicate their value