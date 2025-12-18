
              INSERT INTO tafsirs (ayah_id, kitab, text)
              VALUES (
                (SELECT id FROM ayahs WHERE surah_id = 9 AND ayat = 32),
                'quraish_shihab',
                'Orang-orang kafir itu ingin memadamkan cahaya Allah, yaitu agama Islam, dengan tuduhan-tuduhan palsu mereka. Tetapi Allah hanya ingin menyempurnakan cahaya-Nya dengan memenangkan agama dan menolong Rasul-Nya, meskipun mereka tidak menyukai hal itu.'
              );
            