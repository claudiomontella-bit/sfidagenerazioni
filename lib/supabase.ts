import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
    'https://imuvluzcxskkymjadywh.supabase.co',
  
  'sb_publishable_4cALJchVVAOp3FLCVBbIuQ_D6L_DL4Q'
);

export const QUESTIONS = [
  // ANNI 50 - 60 (Classici, Natale e Musica Italiana)
  { era: '50-60', category: 'Natale', query: 'Jingle Bell Rock Bobby Helms', answer: 'Jingle Bell Rock - Bobby Helms (1957)' },
  { era: '50-60', category: 'Natale', query: 'White Christmas Bing Crosby', answer: 'White Christmas - Bing Crosby' },
  { era: '50-60', category: 'Natale', query: 'Let It Snow Dean Martin', answer: 'Let It Snow! - Dean Martin' },
  { era: '50-60', category: 'Natale', query: 'Rockin Around The Christmas Tree Brenda Lee', answer: 'Rockin Around The Christmas Tree - Brenda Lee' },
  { era: '50-60', category: 'Natale', query: 'It s Beginning to Look a Lot Like Christmas Perry Como', answer: 'Its Beginning to Look a Lot Like Christmas - Perry Como' },
  { era: '50-60', category: 'Natale', query: 'Tu scendi dalle stelle', answer: 'Tu scendi dalle stelle - Tradizionale' },
  { era: '50-60', category: 'Musica Italiana', query: 'Nel blu dipinto di blu Domenico Modugno', answer: 'Nel blu dipinto di blu (Volare) - Domenico Modugno' },
  { era: '50-60', category: 'Musica Italiana', query: 'Azzurro Adriano Celentano', answer: 'Azzurro - Adriano Celentano' },
  { era: '50-60', category: 'Musica Italiana', query: 'Il cielo in una stanza Mina', answer: 'Il cielo in una stanza - Mina' },
  { era: '50-60', category: 'Musica Italiana', query: 'Sapore di sale Gino Paoli', answer: 'Sapore di sale - Gino Paoli' },
  { era: '50-60', category: 'Musica Italiana', query: 'Fatti mandare dalla mamma Gianni Morandi', answer: 'Fatti mandare dalla mamma - Gianni Morandi' },
  { era: '50-60', category: 'Musica Italiana', query: '24000 baci Adriano Celentano', answer: '24.000 baci - Adriano Celentano' },
  { era: '50-60', category: 'Hit Internazionali', query: 'Twist and Shout The Beatles', answer: 'Twist and Shout - The Beatles' },
  { era: '50-60', category: 'Hit Internazionali', query: 'Jailhouse Rock Elvis Presley', answer: 'Jailhouse Rock - Elvis Presley' },
  { era: '50-60', category: 'Cinema e Disney', query: 'Supercalifragilisticexpialidocious Mary Poppins', answer: 'Supercalifragilisticexpialidocious - Mary Poppins' },
  { era: '50-60', category: 'Cinema e Disney', query: 'Bella Notte Lilli e il Vagabondo', answer: 'Bella Notte - Lilli e il Vagabondo' },

  // ANNI 70 - 80 (Cult, Disco, Natale e Cinema)
  { era: '70-80', category: 'Natale', query: 'Last Christmas Wham', answer: 'Last Christmas - Wham! (1984)' },
  { era: '70-80', category: 'Natale', query: 'Happy Xmas War Is Over John Lennon', answer: 'Happy Xmas (War Is Over) - John Lennon' },
  { era: '70-80', category: 'Natale', query: 'Do They Know It s Christmas Band Aid', answer: 'Do They Know Its Christmas? - Band Aid' },
  { era: '70-80', category: 'Natale', query: 'Feliz Navidad Jose Feliciano', answer: 'Feliz Navidad - Jose Feliciano' },
  { era: '70-80', category: 'Natale', query: 'Driving Home for Christmas Chris Rea', answer: 'Driving Home for Christmas - Chris Rea' },
  { era: '70-80', category: 'Musica Italiana', query: 'Sarà perché ti amo Ricchi e Poveri', answer: 'Sara perche ti amo - Ricchi e Poveri' },
  { era: '70-80', category: 'Musica Italiana', query: 'Gloria Umberto Tozzi', answer: 'Gloria - Umberto Tozzi' },
  { era: '70-80', category: 'Musica Italiana', query: 'La canzone del sole Lucio Battisti', answer: 'La canzone del sole - Lucio Battisti' },
  { era: '70-80', category: 'Musica Italiana', query: 'Albachiara Vasco Rossi', answer: 'Albachiara - Vasco Rossi' },
  { era: '70-80', category: 'Musica Italiana', query: 'Ma il cielo è sempre più blu Rino Gaetano', answer: 'Ma il cielo e sempre piu blu - Rino Gaetano' },
  { era: '70-80', category: 'Musica Italiana', query: 'Tanti auguri Raffaella Carra', answer: 'Tanti auguri - Raffaella Carra' },
  { era: '70-80', category: 'Hit Internazionali', query: 'Stayin Alive Bee Gees', answer: 'Stayin Alive - Bee Gees' },
  { era: '70-80', category: 'Hit Internazionali', query: 'Billie Jean Michael Jackson', answer: 'Billie Jean - Michael Jackson' },
  { era: '70-80', category: 'Hit Internazionali', query: 'Dancing Queen ABBA', answer: 'Dancing Queen - ABBA' },
  { era: '70-80', category: 'Cinema e Sigle', query: 'Ghostbusters Ray Parker Jr', answer: 'Ghostbusters - Colonna Sonora' },
  { era: '70-80', category: 'Cinema e Sigle', query: 'Eye of the Tiger Survivor', answer: 'Eye of the Tiger - Rocky III' },

  // ANNI 90 - 2000 (Nostalgia, Natale e Cartoni)
  { era: '90-00', category: 'Natale', query: 'All I Want for Christmas Is You Mariah Carey', answer: 'All I Want for Christmas Is You - Mariah Carey (1994)' },
  { era: '90-00', category: 'Natale', query: 'A Natale puoi Alicia', answer: 'A Natale puoi - Spot Bauli' },
  { era: '90-00', category: 'Natale', query: 'White Christmas Michael Buble', answer: 'White Christmas - Michael Buble' },
  { era: '90-00', category: 'Natale', query: 'Mistletoe Justin Bieber', answer: 'Mistletoe - Justin Bieber' },
  { era: '90-00', category: 'Musica Italiana', query: '50 Special Lunapop', answer: '50 Special - Lunapop' },
  { era: '90-00', category: 'Musica Italiana', query: 'Hanno ucciso l Uomo Ragno 883', answer: 'Hanno ucciso l Uomo Ragno - 883' },
  { era: '90-00', category: 'Musica Italiana', query: 'A te Jovanotti', answer: 'A Te - Jovanotti' },
  { era: '90-00', category: 'Musica Italiana', query: 'La solitudine Laura Pausini', answer: 'La solitudine - Laura Pausini' },
  { era: '90-00', category: 'Musica Italiana', query: 'Xdono Tiziano Ferro', answer: 'Xdono - Tiziano Ferro' },
  { era: '90-00', category: 'Musica Italiana', query: 'Certe notti Ligabue', answer: 'Certe notti - Ligabue' },
  { era: '90-00', category: 'Hit Internazionali', query: 'Wannabe Spice Girls', answer: 'Wannabe - Spice Girls' },
  { era: '90-00', category: 'Hit Internazionali', query: 'Baby One More Time Britney Spears', answer: 'Baby One More Time - Britney Spears' },
  { era: '90-00', category: 'Hit Internazionali', query: 'Blue Da Ba Dee Eiffel 65', answer: 'Blue (Da Ba Dee) - Eiffel 65' },
  { era: '90-00', category: 'Cinema e Disney', query: 'My Heart Will Go On Celine Dion', answer: 'My Heart Will Go On - Titanic' },
  { era: '90-00', category: 'Cinema e Disney', query: 'Il cerchio della vita Il Re Leone', answer: 'Il cerchio della vita - Il Re Leone' },
  { era: '90-00', category: 'Cinema e Disney', query: 'Un amico in me Toy Story', answer: 'Un amico in me - Toy Story' },

  // GEN Z / MODERNI (2010 - Oggi)
  { era: 'GenZ', category: 'Natale', query: 'Santa Tell Me Ariana Grande', answer: 'Santa Tell Me - Ariana Grande' },
  { era: 'GenZ', category: 'Natale', query: 'Snowman Sia', answer: 'Snowman - Sia' },
  { era: 'GenZ', category: 'Natale', query: 'Underneath the Tree Kelly Clarkson', answer: 'Underneath the Tree - Kelly Clarkson' },
  { era: 'GenZ', category: 'Natale', query: 'Santa s Coming for Us Sia', answer: 'Santas Coming for Us - Sia' },
  { era: 'GenZ', category: 'Musica Italiana', query: 'Soldi Mahmood', answer: 'Soldi - Mahmood' },
  { era: 'GenZ', category: 'Musica Italiana', query: 'Zitti e buoni Maneskin', answer: 'Zitti e buoni - Maneskin' },
  { era: 'GenZ', category: 'Musica Italiana', query: 'Brividi Mahmood Blanco', answer: 'Brividi - Mahmood e Blanco' },
  { era: 'GenZ', category: 'Musica Italiana', query: 'Cenere Lazza', answer: 'Cenere - Lazza' },
  { era: 'GenZ', category: 'Musica Italiana', query: 'Sinceramente Annalisa', answer: 'Sinceramente - Annalisa' },
  { era: 'GenZ', category: 'Musica Italiana', query: 'Tuta gold Mahmood', answer: 'Tuta gold - Mahmood' },
  { era: 'GenZ', category: 'Hit Internazionali', query: 'Blinding Lights The Weeknd', answer: 'Blinding Lights - The Weeknd' },
  { era: 'GenZ', category: 'Hit Internazionali', query: 'Shape of You Ed Sheeran', answer: 'Shape of You - Ed Sheeran' },
  { era: 'GenZ', category: 'Hit Internazionali', query: 'Flowers Miley Cyrus', answer: 'Flowers - Miley Cyrus' },
  { era: 'GenZ', category: 'Hit Internazionali', query: 'Espresso Sabrina Carpenter', answer: 'Espresso - Sabrina Carpenter' },
  { era: 'GenZ', category: 'Cinema e Disney', query: 'All alba sorgero Frozen', answer: 'All alba sorgero (Let It Go) - Frozen' },
  { era: 'GenZ', category: 'Cinema e Disney', query: 'Non si nomina Bruno Encanto', answer: 'Non si nomina Bruno - Encanto' },
];
