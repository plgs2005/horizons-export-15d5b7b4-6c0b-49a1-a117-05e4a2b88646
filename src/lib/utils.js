
    import { clsx } from 'clsx';
    import { twMerge } from 'tailwind-merge';
    import { createClient } from '@supabase/supabase-js';

    export function cn(...inputs) {
      return twMerge(clsx(inputs));
    }

    // Initialize Supabase client
    // Updated with credentials from user message
    export const supabase = createClient(
      'https://aorrtyshybjgxkmvoxcr.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvcnJ0eXNoeWJqZ3hrbXZveGNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0MTMxMDgsImV4cCI6MjA2Mjk4OTEwOH0.5Ywa9AdK_bc3HZB7uGoMSx_MrXaqvhIc_l5xsWa2gno'
    );
  