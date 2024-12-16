const mongoose = require("mongoose");

const familySchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: false,
  },
  member_id: {
    type: String,
    required: false,
  },
  name: {
    type: String,
    required: false,
  },
  attributes: {
    image: {
      type: String,
      required: false,
    },
    DOB: {
      type: Date,
      required: false,
    },
    gender: {
      type: String,
      required: false,
    },
    placeOfBirth: {
      type: String,
      required: false,
    },
    bio: {
      type: String,
      required: false,
    },
    spouseInfo: {
      type: String,
      required: false,
    },
    dateOfDeath: {
      type: Date,
      default: null,
    },
    contact: {
      type: String,
      default: null,
    },
    maritalStatus: {
      type: String,
      required: false,
    },
  },
  children: [
    {
      member_id: {
        type: String,
        required: false,
      },
      name: {
        type: String,
        required: false,
      },
      attributes: {
        image: {
          type: String,
          required: false,
        },
        DOB: {
          type: Date,
          required: false,
        },
        gender: {
          type: String,
          required: false,
        },
        placeOfBirth: {
          type: String,
          required: false,
        },
        bio: {
          type: String,
          required: false,
        },
        spouseInfo: {
          type: String,
          required: false,
        },
        dateOfDeath: {
          type: Date,
          default: null,
        },
        contact: {
          type: String,
          default: null,
        },
        maritalStatus: {
          type: String,
          required: false,
        },
      },
      children: [
        // Nested children structure allows for alternative hierarchies
        {
          type: mongoose.Schema.Types.Mixed, // Allows flexibility for varying child structures
        },
      ],
    },
  ],
});

const Family = mongoose.model("Family", familySchema);

module.exports = Family;
