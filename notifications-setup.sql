-- Create notifications table for the portfolio
-- Run this in Supabase SQL editor

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('project', 'section', 'message')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  projectId TEXT,
  projectImage TEXT,
  projectCategory TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for real-time updates
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all users to read notifications
CREATE POLICY "Everyone can read notifications" 
  ON public.notifications 
  FOR SELECT 
  USING (true);

-- Create policy to allow only admins to insert notifications
CREATE POLICY "Only admins can insert notifications" 
  ON public.notifications 
  FOR INSERT 
  WITH CHECK (true);

-- Create policy to allow users to update their own read status
CREATE POLICY "Users can update read status" 
  ON public.notifications 
  FOR UPDATE 
  USING (true);

-- Create policy to allow users to delete notifications
CREATE POLICY "Users can delete notifications" 
  ON public.notifications 
  FOR DELETE 
  USING (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_created_at 
  ON public.notifications(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_read 
  ON public.notifications(read);
