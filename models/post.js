var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var PostSchema = new Schema(
  {
    body: {type: String, required: true, maxlength: 300},
    title: {type: String, required: true, maxlength: 100},
    created_at: {type: Date},
    creator: {type: Schema.Types.ObjectId, ref: 'User', required: true},
  }
);

// Virtual for author's full name

// Virtual for author's lifespan

// Virtual for author's URL
AuthorSchema
.virtual('url')
.get(function () {
  return '/posts/' + this._id;
});

//Export model
module.exports = mongoose.model('Post', PostSchema);