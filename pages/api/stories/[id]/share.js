import dbConnect from '../../../../lib/dbConnect';
import Story from '../../../../models/Story';
import { getSession } from 'next-auth/react';
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  const { id } = req.query;
  const { email, message } = req.body;
  
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }
  
  await dbConnect();

  try {
    const story = await Story.findOne({
      _id: id,
      userId: session.user.id
    });

    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    // Add email to sharedWith array if it's not already there
    if (!story.sharedWith.includes(email)) {
      story.sharedWith.push(email);
      await story.save();
    }

    // Generate unique access link
    const shareToken = Buffer.from(`${story._id}-${Date.now()}`).toString('base64');
    const shareLink = `${process.env.NEXTAUTH_URL}/shared-stories/${story._id}?token=${shareToken}`;

    // Check if email configuration is available
    if (!process.env.EMAIL_SERVER_HOST || !process.env.EMAIL_SERVER_USER) {
      return res.status(503).json({
        message: 'Email service not configured. Please contact the administrator.',
        code: 'EMAIL_NOT_CONFIGURED'
      });
    }

    // Set up email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: process.env.EMAIL_SERVER_PORT,
      secure: process.env.EMAIL_SERVER_PORT === 465,
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD
      }
    });
    
    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || `"Sight Word Stories" <${process.env.EMAIL_SERVER_USER}>`,
      to: email,
      subject: `${session.user.name} shared a sight word story with you: "${story.title}"`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1e40af; font-size: 24px;">Sight Word Story</h1>
          <p>${session.user.name} has shared a sight word story with you.</p>
          <h2 style="color: #1f2937; font-size: 20px;">${story.title}</h2>
          ${message ? `<p style="font-style: italic; color: #4b5563; padding: 10px; background-color: #f3f4f6; border-radius: 4px;">"${message}"</p>` : ''}
          <p>This story contains ${story.words.length} sight words and is designed for Grade ${story.grade} readers.</p>
          <div style="margin: 20px 0;">
            <a href="${shareLink}" style="background-color: #2563eb; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">View the Story</a>
          </div>
          <p style="color: #6b7280; font-size: 14px;">This link will allow you to view the shared story.</p>
        </div>
      `
    });
    
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error sharing story:', error);
    return res.status(500).json({ message: 'Error sharing story' });
  }
}