const Family = require("../models/Family");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configure S3 client
// const s3 = new S3Client({
//   region: process.env.AWS_REGION,
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//   },
// });

// // Multer setup for file upload
// const upload = multer({ dest: "uploads/" });

// // Function to upload image to S3
// const uploadImageToS3 = async (fileName, filePath) => {
//   const fileStream = fs.createReadStream(filePath);
//   console.log(`Uploading image to s3 ${fileName}`);
//   const uploadParams = {
//     Bucket: process.env.S3_BUCKET_NAME,
//     Key: fileName,
//     Body: fileStream,
//   };

//   try {
//     const data = await s3.send(new PutObjectCommand(uploadParams));
//     // Clean up local file after upload
//     fs.unlinkSync(filePath);
//     console.log(
//       "final url ",
//       `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/${fileName}`
//     );
//     return `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/${fileName}`;
//   } catch (error) {
//     throw new Error("Error uploading image to S3: " + error.message);
//   }
// };

// Helper function to find a member recursively and add a child
const addChildRecursive = (member, parentId, child) => {
  if (member.member_id === parentId) {
    // Assign new member_id to the child
    const newMemberId = `${parentId}.${member.children.length + 1}`;
    child.member_id = newMemberId;
    member.children.push(child);
    return true; // Child added successfully
  }

  for (let childMember of member.children) {
    if (addChildRecursive(childMember, parentId, child)) {
      return true; // Child added in deeper nested structure
    }
  }

  return false; // Parent ID not found in this branch
};

// Add Child API
const addChild = async (req, res) => {
  try {
    const user_id = req.user.user_id; // Assumes middleware populates `req.user`
    const { parent_id, name, image, attributes } = req.body;

    const parsedAttributes = attributes ? JSON.parse(attributes) : {};

    console.log("Attributes are:", parsedAttributes);
    console.log("File is:", req.file); // Check if the file is received

    const family = await Family.findOne({ user_id });
    if (!family) {
      return res.status(404).json({ error: "Family not found" });
    }

    console.log("image and name is", image, name);

    // Upload the file if it exists
    // if (image) {
    //   const imageUrl = await uploadImageToS3(image.path, image.path);
    //   parsedAttributes.image = imageUrl;
    // }

    const newChild = { name, attributes: parsedAttributes, children: [] };
    const added = addChildRecursive(family, parent_id, newChild);

    if (!added) {
      return res.status(404).json({ error: "Parent not found" });
    }

    await family.save();
    res
      .status(201)
      .json({ success: true, message: "Child added successfully", family });
  } catch (error) {
    console.error("Error adding child:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  addChild,
};
