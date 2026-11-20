import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://imuvluzcxskkymjadywh.supabase.co',
  'sb_publishable_4cALJchVVAOp3FLCVBbIuQ_D6L_DL4Q'
);

export const QUESTIONS = [
  {
    era: '50-60',
    query: 'Jingle Bell Rock Bobby Helms',
    answer: 'Jingle Bell Rock - Bobby Helms (1957)',
  },
  {
    era: '50-60',
    query: 'White Christmas Bing Crosby',
    answer: 'White Christmas - Bing Crosby',
  },
  {
    era: '70-80',
    query: 'Last Christmas Wham',
    answer: 'Last Christmas - Wham! (1984)',
  },
  {
    era: '70-80',
    query: 'Happy Xmas War Is Over John Lennon',
    answer: 'Happy Xmas (War Is Over) - John Lennon',
  },
  {
    era: '90-00',
    query: 'All I Want for Christmas Is You Mariah Carey',
    answer: 'All I Want for Christmas Is You - Mariah Carey (1994)',
  },
  { era: '90-00', query: 'A te Jovanotti', answer: 'A Te - Jovanotti' },
  {
    era: 'GenZ',
    query: 'Santa Tell Me Ariana Grande',
    answer: 'Santa Tell Me - Ariana Grande',
  },
  { era: 'GenZ', query: 'Snowman Sia', answer: 'Snowman - Sia' },
];
