/*

Hierarchy plan:

Mainbox
ImageForm             // Submit new image
ImageList             // List of images
  ImageBox            // Container for individual "post"; img+comments
    Image             // Image itself
    CommentList       // List of the comments
      Comment         // Individual comment
  ImageBox
    Image
    ...

*/

// Main container
var MainBox = React.createClass({
  render: function() {
    return (
      <div className="mainBox">
        <h1>ReactGIFs</h1>
        <p>ReactGIFs is a React-based image sharing site.</p>
        <ImageForm />
        <ImageList data={this.props.data}/>
      </div>  
      );
  }
});

// Class for the list of images
var ImageList = React.createClass({
  render: function() {
    var imageNodes = this.props.data.map(function(image) {
    return (
      <ReactGIF author={image.author} key={image.id} alt= {image.alt} src={image.src} title={image.title} comments={image.comments}>
      </ReactGIF>
    );
      
    });
    return (
      <div className="imageList">
        {imageNodes}
      </div>
    );
  }
});

// Class for the image posting form
var ImageForm = React.createClass({
  render: function() {
    return (
      <div className="imageForm">
        Placeholder - Image submit form here.
      </div>
    );
  }
});

// Individual image object
var ReactGIF = React.createClass({
  render: function() {
    return (
      <div className="image">
        <h2 className="imageTitle"> {this.props.title} </h2>
        <p>Posted by: {this.props.author}</p>
        <img alt={this.props.alt} src={this.props.src} />
        <CommentList comments={this.props.comments} />
      </div>
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
        <h3>Comments</h3>
        {commentNodes}
        <CommentForm />
      </div>
    );
  }
});

var CommentForm = React.createClass({
  render: function() {
    return (
      <div className="commentForm">
        Placeholder - Comment submit form here.
      </div>
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


var data = [
  {id: 1, title: "imagetitle", author: "imageauthor", src: "", alt: "foo",
  comments: [
    {id: 2, author: "Person 1", text: "This is one comment"},
    {id: 3, author: "Person 2", text: "This is *another* comment"}
    ]
  }
];

ReactDOM.render(
  <MainBox data={data}/>,
  document.getElementById('content'))