const Family = require('../models/Family');
const familyService = require('../services/familyService');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

// Initialize the S3 client
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Function to upload an image to S3
const uploadImageToS3 = async (fileName, filePath) => {
  const fileStream = fs.createReadStream(filePath);
  const uploadParams = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: fileName,
    Body: fileStream,
  };

  try {
    const data = await s3.send(new PutObjectCommand(uploadParams));
    return `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/${fileName}`;
  } catch (error) {
    throw new Error('Error uploading image to S3: ' + error.message);
  }
};

// POST API to add family tree data
const addFamily = async (req, res) => {
  try {
    const familyData = req.body;

    // Ensure the user_id from the logged-in user is included in the JSON
    familyData.user_id = req.user.user_id; 

    // Upload images to S3 and update the familyData
    for (const member of familyData.children) {
      if (member.attributes.image) {
        const imagePath = path.join(__dirname, '../uploads', member.attributes.image); // Adjust as per your file location
        const imageUrl = await uploadImageToS3(member.attributes.image, imagePath);
        member.attributes.image = imageUrl; // Store the S3 URL
      }
    }

    const newFamily = await familyService.createFamily(familyData);
    res.status(201).json("Tree saved");
  } catch (error) {
    if (error.code === 11000) {
      res.status(409).json({ error: 'User ID already exists.' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};

// GET API to retrieve family tree data by user_id
const getFamilyByUserId = async (req, res) => {
  try {
    const userId = req.user.user_id;  // Extract user_id from the decoded JWT token
    const family = await Family.findOne({ user_id: userId });
    
    if (!family) {
      return res.status(404).json({ error: 'Family not found' });
    }
    
    res.json(family);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong!' });
  }
};

module.exports = {
  addFamily,
  getFamilyByUserId,
};