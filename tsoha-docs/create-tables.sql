CREATE TABLE Person(
  id SERIAL PRIMARY KEY,
  auth0_id text NOT NULL -- user_id field from Auth0 login provider
);

CREATE TABLE Gallery(
  id text PRIMARY KEY, -- unique gallery shortid generated from node
  submitter integer REFERENCES Person(id), -- reference to a Person
  title text NOT NULL -- title of gallery posting
);

CREATE TABLE Comment(
  id text PRIMARY KEY, -- unique comment shortid generated from node
  parent text, -- shortid for gallery or comment that is this comment's parent
  submitter integer REFERENCES Person(id),
  content text -- comment content
);

CREATE TABLE Image(
  id text PRIMARY KEY, -- unique image shortid generated from node
  submitter integer REFERENCES Person(id),
  caption text, -- image caption and alt-text
  gallery_id text REFERENCES Gallery(id) -- gallery the image belongs to
);

CREATE TABLE Vote(
  id SERIAL PRIMARY KEY,
  value int CHECK (value = -1 OR value = 1), -- upvote = 1, downvote = -1
  submitter integer REFERENCES Person(id),
  target_id text -- unique shortid for either a Gallery or a Comment that this vote is applied to
);

CREATE TABLE Tag(
  id SERIAL PRIMARY KEY,
  name text -- tag name
);

CREATE TABLE Gallery_Tag( -- Intermediary table for many-to-many magic
  tag_id integer REFERENCES Tag(id)
                  ON UPDATE CASCADE
                  ON DELETE CASCADE,
  gallery_id text REFERENCES Gallery(id)
                  ON UPDATE CASCADE
                  ON DELETE CASCADE,
  tag_order SMALLINT,
  PRIMARY KEY (tag_id, gallery_id)
);