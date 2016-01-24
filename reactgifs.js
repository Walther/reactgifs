/*

Hierarchy plan:

Mainbox
ImageForm             // Submit new image
Post                  // A post has one or more images and one commentbox
    Image             // Image itself
    Image...
    CommentList       // List of the comments
      Comment         // Individual comment
      Comment         // May have same-level comments
        Comment       // May have children
*/

// Post has a title, one or more images with captions, and a comment box
var Post = React.createClass({
  getInitialState: function() {
    return {data: []};
  },
  componentDidMount: function() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  render: function() {
    console.log(this.state.data.images)
    if (this.state.data.images) {
      var images = this.state.data.images.map(function(image) {
        return (
          <Image alt={image.alt} src={image.src} txt={image.txt} />
        )
      })
    } else {
      return (<p>loading...</p>);
    }

    return (
      <div className="post">
        <h1>{this.state.data.title}</h1>
        <p>posted by: {this.state.data.author} </p>
        {images}
        <CommentList comments={this.state.data.comments} />
      </div>
    );
  }
})

// Class for the image posting form
var ImageForm = React.createClass({
  getInitialState: function() {
    return {author: '', title: '', caption: ''};
  },
  handleAuthorChange: function(e) {
    this.setState({author: e.target.value});
  },
  handleTitleChange: function(e) {
    this.setState({title: e.target.value});
  },
  handleCaptionChange: function(e) {
    this.setState({caption: e.target.value});
  },
  handleSubmit: function(e) {
    e.preventDefault();
    var author = this.state.author.trim();
    var title = this.state.title.trim();
    var caption = this.state.caption.trim();
    if (!author || !title || !caption ) {
      console.log("something was empty")
      return;
    }

    var data = new FormData();
    data.append("author", author);
    data.append("title", title);
    data.append("caption", caption);
    $.each(jQuery('#file')[0].files, function(i, file) {
        data.append('file-'+i, file);
    });
    $.ajax({
        url: '/upload',
        data: data,
        cache: false,
        contentType: false,
        processData: false,
        type: 'POST',
        success: function(data){
            window.location.hash=data;
        }
    });
  },

  render: function() {
    return (
      <form className="imageForm" encType="multipart/form-data" onSubmit={this.handleSubmit}>
        <input type="hidden" name="command" value="post" />
        <input
          type="text"
          placeholder="Author"
          value={this.state.author}
          onChange={this.handleAuthorChange}
        />
        <br/>
        <input
          type="text"
          placeholder="Title"
          value={this.state.title}
          onChange={this.handleTitleChange}
        />
        <br/>
        <input id="file" type="file" name="file" multiple="multiple" />
        <br/>
        <input
          type="text"
          placeholder="Caption"
          value={this.state.caption}
          onChange={this.handleCaptionChange}
        />
        <br/>
        <input type="submit" value="Post image" className="button"/>
      </form>
    );
  }
});

// Individual image object
var Image = React.createClass({
  render: function() {
    return (
      <figure className="image">
        <img alt={this.props.alt} src={this.props.src} />
        <figcaption>{this.props.txt}</figcaption>
      </figure>
    );
  }
});


// Comments

var CommentList = React.createClass({
  render: function() {
    var commentNodes = this.props.comments.map(function(comment) {
    return (
      <Comment author={comment.author} key={comment.id}>
        {comment.text}
      </Comment>
    )
    });
    return (
      <div className="commentList">
        <div className="clear"></div>
        <h2>Comments</h2>
        {commentNodes}
        <CommentForm />
      </div>
    );
  }
});

var CommentForm = React.createClass({
  getInitialState: function() {
    return {author: '', text: ''};
  },
  handleAuthorChange: function(e) {
    this.setState({author: e.target.value});
  },
  handleTextChange: function(e) {
    this.setState({text: e.target.value});
  },
  handleSubmit: function(e) {
    console.log("button clicked")
    e.preventDefault();
    var author = this.state.author.trim();
    var text = this.state.text.trim();
    if (!author || !text ) {
      console.log("something was empty")
      return;
    }

    var obj = {
      "command": "comment",
      "author": author,
      "text": text,
      "imageid": window.location.hash.slice(1)
    }

    $.ajax({
      type: "POST",
      url: "/api",
      data: JSON.stringify(obj),
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      success: function(msg, status, jqXHR) {
        window.location.reload(true);
      },
      failure: function(errMsg) {alert(errMsg);}
    });

    this.setState(this.getInitialState());
  },
  render: function() {
    return (
      <form className="commentForm" onSubmit={this.handleSubmit}>
        <input
          type="text"
          placeholder="Name"
          value={this.state.author}
          onChange={this.handleAuthorChange}
        />
        <br />
        <input
          type="text"
          placeholder="Text"
          value={this.state.text}
          onChange={this.handleTextChange}
        />
        <br/>
        <input className="button" type="submit" value="Submit comment" />
      </form>
    );
  }
});

var Comment = React.createClass({
  render: function() {
    return (
      <div className="comment">
        <strong className="commentAuthor">
          {this.props.author}:
        </strong>
        {this.props.children}
      </div>
    );
  }
});


// Main render function;
// serve either index page or the page content requested
var main = function() {
  var id = window.location.hash.slice(1);
  // Index page
  if (id.length === 0) {
    ReactDOM.render(
      <div className="index">
        <h1>ReactGIFs</h1>
        <p>ReactGIFs is a React-based image sharing site.</p>
        <ImageForm />
      </div>
      , document.getElementById('content'))
  }
  else {
    id = "data/" + id;
    ReactDOM.render(<Post url={id}/>, document.getElementById('content'))
  }
}

// Run main at least once on initial load
main();

// Re-run main if the hash-url changes
$(window).on('hashchange', function() {
  main();
})
