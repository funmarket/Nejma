export const MARKETPLACE_SUBCATEGORIES: Record<string, string[]> = {
  music: ['Instruments', 'DJ Gear', 'Studio Gear', 'Outfits/Stagewear', 'Music (Digital)', 'CDs', 'Vinyl', 'Vintage Gear', 'Accessories', 'Other'],
  acting: ['Costumes', 'Props', 'Scripts', 'Coaching Sessions', 'Audition Services', 'Acting Classes', 'Tickets', 'Other'],
  creator: ['Painting', 'Graffiti', 'Digital Art', 'Sculpture', 'Design', 'Fashion', 'Photography', 'Handmade', 'Prints', 'Other']
};

export const RENTAL_SUBCATEGORIES: Record<string, string[]> = {
  music: ['Instruments', 'DJ Gear', 'Studio Gear', 'Outfits/Stagewear', 'Sound Equipment', 'Microphones', 'Speakers', 'Accessories', 'Other'],
  acting: ['Costumes', 'Props', 'Lighting', 'Cameras', 'Sound Equipment', 'Makeup/Hair', 'Stage Equipment', 'Other'],
  creator: ['Cameras', 'Lighting', 'Art Tools', 'Studio Space', 'Equipment', 'Props', 'Other'],
  dance: ['Costumes', 'Sound Equipment', 'Lighting', 'Props', 'Studio Space', 'Other'],
  art: ['Cameras', 'Lighting', 'Art Supplies', 'Studio Space', 'Equipment', 'Other'],
  film: ['Cameras', 'Lighting', 'Sound Equipment', 'Props', 'Costumes', 'Locations', 'Other'],
  technology: ['Computers', 'Software', 'Equipment', 'Accessories', 'Other'],
  photography: ['Cameras', 'Lenses', 'Lighting', 'Backdrops', 'Props', 'Studio Space', 'Other']
};

export const ADMIN_WALLET = 'HZ2GQg1Qdh4kmGSTjRBAHVwTw88JVqkL1Hda2Y1Tqxgs'.toLowerCase();

export const TALENT_CATEGORIES = {
    music: {
      label: "Music",
      subcategories: [{
        value: "singer",
        label: "Singer"
      }, {
        value: "dj",
        label: "DJ"
      }, {
        value: "dancer",
        label: "Dancer"
      }, {
        value: "solo_instrumentalist",
        label: "Solo Instrumentalist"
      }, {
        value: "band",
        label: "Band"
      }, {
        value: "producer",
        label: "Producer"
      }, {
        value: "rapper",
        label: "Rapper"
      }, {
        value: "songwriter",
        label: "Songwriter"
      }, {
        value: "electronic",
        label: "Electronic"
      }]
    },
    acting: {
      label: "Acting",
      subcategories: [{
        value: "actor_film_tv",
        label: "Film/TV Actor"
      }, {
        value: "theatre",
        label: "Theatre"
      }, {
        value: "standup_comedy",
        label: "Standup Comedy"
      }, {
        value: "skits_shortform",
        label: "Skits/Short-form"
      }, {
        value: "improv",
        label: "Improv"
      }, {
        value: "voice_actor",
        label: "Voice Actor"
      }, {
        value: "jokes",
        label: "Jokes"
      }]
    },
    creator: {
      label: "Creator",
      subcategories: [{
        value: "painting",
        label: "Painting"
      }, {
        value: "graffiti",
        label: "Graffiti"
      }, {
        value: "digital_art",
        label: "Digital Art"
      }, {
        value: "sculpture",
        label: "Sculpture"
      }, {
        value: "design",
        label: "Design"
      }, {
        value: "fashion",
        label: "Fashion"
      }, {
        value: "photography",
        label: "Photography"
      }, {
        value: "handmade",
        label: "Handmade"
      }, {
        value: "mixed_media",
        label: "Mixed Media"
      }]
    }
};
