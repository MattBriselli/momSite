const fs = require('fs');
const path = require('path');

const SITE_URL = (process.env.SITE_URL || 'https://ariosoquartet.com').replace(/\/+$/, '');
const PUBLIC_DIR = path.join(__dirname, 'public');
const REPERTOIRE_EJS_PATH = path.join(__dirname, 'views', 'sections', 'repertoire-explorer.ejs');
const TODAY = new Date().toISOString().split('T')[0];

/**
 * Structured Venue Directory with Regional & Category Classifications
 * Supports both long-tail regional SEO (/venues) and machine-readable /venues.json
 */
const VENUES_DATA = [
  // Mansions, Estates, Restaurants & Golf Clubs
  { name: 'Abington Art Center', city: 'Abington', state: 'PA', category: 'estates', region: 'pa-suburbs' },
  { name: 'Aldie Mansion', city: 'Doylestown', state: 'PA', category: 'estates', region: 'pa-suburbs' },
  { name: 'Appleford Estate', city: 'Villanova', state: 'PA', category: 'estates', region: 'pa-suburbs' },
  { name: 'Aronimink Golf Club', city: 'Newtown Square', state: 'PA', category: 'estates', region: 'pa-suburbs' },
  { name: 'Arts Ballroom', city: 'Philadelphia', state: 'PA', category: 'estates', region: 'philadelphia' },
  { name: 'The Ashford Estate', city: 'Allentown', state: 'NJ', category: 'estates', region: 'new-jersey' },
  { name: 'Audubon Center at Mill Grove', city: 'Audubon', state: 'PA', category: 'estates', region: 'pa-suburbs' },
  { name: 'Bowman’s Hill Wildflower Preserve', city: 'New Hope', state: 'PA', category: 'estates', region: 'pa-suburbs' },
  { name: 'Brandywine Manor House', city: 'Honeybrook', state: 'PA', category: 'estates', region: 'pa-suburbs' },
  { name: 'Brantwyn Mansion', city: 'Wilmington', state: 'DE', category: 'estates', region: 'delaware' },
  { name: 'Cairnwood Estate', city: 'Bryn Athyn', state: 'PA', category: 'estates', region: 'pa-suburbs' },
  { name: 'The Carriage House', city: 'Galloway', state: 'NJ', category: 'estates', region: 'new-jersey' },
  { name: 'Celebrations', city: 'Bensalem', state: 'PA', category: 'estates', region: 'pa-suburbs' },
  { name: "Clark's Landing", city: 'Point Pleasant Beach', state: 'NJ', category: 'estates', region: 'new-jersey' },
  { name: 'College of Physicians', city: 'Philadelphia', state: 'PA', category: 'estates', region: 'philadelphia' },
  { name: 'Colonial Dames', city: 'Philadelphia', state: 'PA', category: 'estates', region: 'philadelphia' },
  { name: 'Concord Country Club', city: 'West Chester', state: 'PA', category: 'estates', region: 'pa-suburbs' },
  { name: 'Crystal Tea Room', city: 'Philadelphia', state: 'PA', category: 'estates', region: 'philadelphia' },
  { name: 'Deerfield Golf and Tennis Club', city: 'Newark', state: 'DE', category: 'estates', region: 'delaware' },
  { name: 'Donaldson Browne Center', city: 'Port Deposit', state: 'MD', category: 'estates', region: 'greater-region' },
  { name: 'DuPont Country Club', city: 'Wilmington', state: 'DE', category: 'estates', region: 'delaware' },
  { name: 'Erini Restaurant', city: 'Ewing', state: 'NJ', category: 'estates', region: 'new-jersey' },
  { name: 'Fonthill Castle', city: 'Doylestown', state: 'PA', category: 'estates', region: 'pa-suburbs' },
  { name: 'The Fountain Room', city: 'Philadelphia', state: 'PA', category: 'estates', region: 'philadelphia' },
  { name: 'Fuel Gallery', city: 'Philadelphia', state: 'PA', category: 'estates', region: 'philadelphia' },
  { name: 'Greenville Country Club', city: 'Greenville', state: 'DE', category: 'estates', region: 'delaware' },
  { name: 'Greystone Hall', city: 'West Chester', state: 'PA', category: 'estates', region: 'pa-suburbs' },
  { name: 'The Inn at Barley Sheaf', city: 'Holicong', state: 'PA', category: 'estates', region: 'pa-suburbs' },
  { name: 'Jericho National Golf Club', city: 'New Hope', state: 'PA', category: 'estates', region: 'pa-suburbs' },
  { name: 'Joseph Ambler Inn', city: 'North Wales', state: 'PA', category: 'estates', region: 'pa-suburbs' },
  { name: 'Knowlton Mansion', city: 'Doylestown', state: 'PA', category: 'estates', region: 'pa-suburbs' },
  { name: "Martell's Water's Edge", city: 'Bayville', state: 'NJ', category: 'estates', region: 'new-jersey' },
  { name: "McCall's Country Club", city: 'Upper Darby', state: 'PA', category: 'estates', region: 'pa-suburbs' },
  { name: 'Mendenhall Inn', city: 'Mendenhall', state: 'PA', category: 'estates', region: 'pa-suburbs' },
  { name: 'The Old Mill', city: 'Rose Valley', state: 'PA', category: 'estates', region: 'pa-suburbs' },
  { name: 'Phoenixville Foundry', city: 'Phoenixville', state: 'PA', category: 'estates', region: 'pa-suburbs' },
  { name: 'Radnor Hunt Club', city: 'Malvern', state: 'PA', category: 'estates', region: 'pa-suburbs' },
  { name: 'Ridley Creek Mansion', city: 'Newtown Square', state: 'PA', category: 'estates', region: 'pa-suburbs' },
  { name: 'Rockwood Center', city: 'Wilmington', state: 'DE', category: 'estates', region: 'delaware' },
  { name: 'Rose Hip Barn', city: 'Thornton', state: 'PA', category: 'estates', region: 'pa-suburbs' },
  { name: 'Rydal Park Retirement Community', city: 'Jenkintown', state: 'PA', category: 'estates', region: 'pa-suburbs' },
  { name: 'The Shambles at Head House Square', city: 'Philadelphia', state: 'PA', category: 'estates', region: 'philadelphia' },
  { name: 'Stotesbury Mansion', city: 'Philadelphia', state: 'PA', category: 'estates', region: 'philadelphia' },
  { name: 'Swarthmore College Amphitheater', city: 'Swarthmore', state: 'PA', category: 'estates', region: 'pa-suburbs' },
  { name: 'Sweetwater Farm', city: 'Glen Mills', state: 'PA', category: 'estates', region: 'pa-suburbs' },
  { name: 'Talula’s Garden', city: 'Philadelphia', state: 'PA', category: 'estates', region: 'philadelphia' },
  { name: 'Unionville Winery', city: 'Ringoes', state: 'NJ', category: 'estates', region: 'new-jersey' },
  { name: 'University and Whist Club', city: 'Wilmington', state: 'DE', category: 'estates', region: 'delaware' },
  { name: 'Valley Green Inn', city: 'Philadelphia', state: 'PA', category: 'estates', region: 'philadelphia' },
  { name: 'Villanova Conference Center', city: 'Villanova', state: 'PA', category: 'estates', region: 'pa-suburbs' },
  { name: 'Whitemarsh Valley Country Club', city: 'Lafayette Hill', state: 'PA', category: 'estates', region: 'pa-suburbs' },
  { name: 'Winterthur Museum, Garden & Library', city: 'Wilmington', state: 'DE', category: 'estates', region: 'delaware' },

  // Luxury & Historic Hotels
  { name: 'The Bellevue Hotel', city: 'Philadelphia', state: 'PA', category: 'hotels', region: 'philadelphia' },
  { name: 'Black Bass Hotel', city: 'Lumberville', state: 'PA', category: 'hotels', region: 'pa-suburbs' },
  { name: 'The Desmond Hotel', city: 'Malvern', state: 'PA', category: 'hotels', region: 'pa-suburbs' },
  { name: 'Four Seasons Hotel', city: 'Philadelphia', state: 'PA', category: 'hotels', region: 'philadelphia' },
  { name: 'Hotel DuPont', city: 'Wilmington', state: 'DE', category: 'hotels', region: 'delaware' },
  { name: 'Loews Philadelphia Hotel', city: 'Philadelphia', state: 'PA', category: 'hotels', region: 'philadelphia' },
  { name: 'Philadelphia Marriott West', city: 'Conshohocken', state: 'PA', category: 'hotels', region: 'pa-suburbs' },
  { name: 'The Rittenhouse Hotel', city: 'Philadelphia', state: 'PA', category: 'hotels', region: 'philadelphia' },
  { name: 'The Westin Philadelphia', city: 'Philadelphia', state: 'PA', category: 'hotels', region: 'philadelphia' },

  // Churches, Cathedrals & Synagogues
  { name: 'Albright Chapel', city: 'Reading', state: 'PA', category: 'worship', region: 'greater-region' },
  { name: 'Baptist Church in the Great Valley', city: 'Devon', state: 'PA', category: 'worship', region: 'pa-suburbs' },
  { name: 'Bausman Memorial United Church of Christ', city: 'Wyomissing', state: 'PA', category: 'worship', region: 'greater-region' },
  { name: 'Cathedral Basilica of Sts. Peter and Paul', city: 'Philadelphia', state: 'PA', category: 'worship', region: 'philadelphia' },
  { name: 'First Baptist Church', city: 'Philadelphia', state: 'PA', category: 'worship', region: 'philadelphia' },
  { name: 'Grace Bible Fellowship Church', city: 'Wallingford', state: 'PA', category: 'worship', region: 'pa-suburbs' },
  { name: 'Jordan United Church of Christ', city: 'Allentown', state: 'PA', category: 'worship', region: 'greater-region' },
  { name: 'Kemblesville United Methodist Church', city: 'Newark', state: 'DE', category: 'worship', region: 'delaware' },
  { name: 'Our Lady of Mount Carmel Church', city: 'Doylestown', state: 'PA', category: 'worship', region: 'pa-suburbs' },
  { name: 'Our Lady of the Rosary Church', city: 'Coatesville', state: 'PA', category: 'worship', region: 'pa-suburbs' },
  { name: 'St. Ann’s Church', city: 'Wilmington', state: 'DE', category: 'worship', region: 'delaware' },
  { name: 'St. Augustine’s Church', city: 'Ocean City', state: 'NJ', category: 'worship', region: 'new-jersey' },
  { name: 'St. Denis Catholic Church', city: 'Havertown', state: 'PA', category: 'worship', region: 'pa-suburbs' },
  { name: 'St. Francis de Sales Church', city: 'Lenni', state: 'PA', category: 'worship', region: 'pa-suburbs' },
  { name: 'St. James Church', city: 'Elkins Park', state: 'PA', category: 'worship', region: 'pa-suburbs' },
  { name: 'St. Joan of Arc Catholic Church', city: 'Hershey', state: 'PA', category: 'worship', region: 'greater-region' },
  { name: 'St. John Chrysostom Church', city: 'Wallingford', state: 'PA', category: 'worship', region: 'pa-suburbs' },
  { name: 'St. John’s Episcopal Church', city: 'Huntingdon Valley', state: 'PA', category: 'worship', region: 'pa-suburbs' },
  { name: 'St. Mark’s Church', city: 'Philadelphia', state: 'PA', category: 'worship', region: 'philadelphia' },
  { name: 'St. Mary of the Assumption Church', city: 'Hockessin', state: 'DE', category: 'worship', region: 'delaware' },
  { name: 'St. Paul’s Episcopal Church', city: 'Ardmore', state: 'PA', category: 'worship', region: 'pa-suburbs' },
  { name: 'St. Rita’s Church', city: 'Philadelphia', state: 'PA', category: 'worship', region: 'philadelphia' },
  { name: 'Sts. Peter and Paul Catholic Church', city: 'West Chester', state: 'PA', category: 'worship', region: 'pa-suburbs' },
  { name: 'Temple Sinai', city: 'Dresher', state: 'PA', category: 'worship', region: 'pa-suburbs' },
  { name: 'Unitarian Universalist Church', city: 'Media', state: 'PA', category: 'worship', region: 'pa-suburbs' }
];

const REGION_META = {
  philadelphia: 'Philadelphia (Center City & Historic Districts)',
  'pa-suburbs': 'Main Line, Bucks, Chester, Delaware & Montgomery Counties (PA)',
  delaware: 'Wilmington, Brandywine Valley & Northern Delaware',
  'new-jersey': 'Southern & Central New Jersey & Jersey Shore',
  'greater-region': 'Lehigh Valley, Reading, Hershey & Northern Maryland'
};

const CATEGORY_META = {
  estates: 'Mansions, Estates, Restaurants & Golf Clubs',
  hotels: 'Luxury & Historic Hotels',
  worship: 'Churches, Cathedrals & Synagogues'
};

function decodeEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&rsquo;/g, '’')
    .replace(/&ldquo;/g, '“')
    .replace(/&rdquo;/g, '”')
    .trim();
}

/**
 * Parses views/pages/repertoire.ejs into structured JSON
 */
function parseRepertoireFromEjs() {
  const raw = fs.readFileSync(REPERTOIRE_EJS_PATH, 'utf8');
  const boxBlocks = raw.split('<div class="box">').slice(1);
  const categories = [];
  let totalSelections = 0;

  for (const block of boxBlocks) {
    const h4Match = block.match(/<h4\s+id="([^"]+)">([^<]+)<\/h4>/i);
    if (!h4Match) continue;
    const id = h4Match[1].trim();
    const title = decodeEntities(h4Match[2]);

    const ulRegex = /<ul(?:\s+data-key="([^"]*)")?>([\s\S]*?)<\/ul>/gi;
    const groupsMap = new Map();
    let categoryCount = 0;
    let ulMatch;

    while ((ulMatch = ulRegex.exec(block)) !== null) {
      const inner = ulMatch[2];
      const firstLiIndex = inner.search(/<li\b/i);
      const headerText = firstLiIndex > -1 ? decodeEntities(inner.slice(0, firstLiIndex)) : '';
      const groupName = headerText || title;

      const liPart = firstLiIndex > -1 ? inner.slice(firstLiIndex) : '';
      const rawItems = liPart.split(/<li\b[^>]*>/i).slice(1);
      const songs = rawItems
        .map((chunk) => decodeEntities(chunk.replace(/<\/li>[\s\S]*$/i, '').split('\n')[0]))
        .filter(Boolean);

      if (songs.length > 0) {
        if (!groupsMap.has(groupName)) {
          groupsMap.set(groupName, []);
        }
        groupsMap.get(groupName).push(...songs);
        categoryCount += songs.length;
      }
    }

    totalSelections += categoryCount;
    const groups = Array.from(groupsMap.entries()).map(([group, selections]) => ({
      group,
      selections
    }));

    categories.push({
      id,
      title,
      url: `${SITE_URL}/music#${id}`,
      selectionCount: categoryCount,
      groups
    });
  }

  return {
    ensemble: 'Arioso String Quartet',
    siteUrl: SITE_URL,
    updatedAt: TODAY,
    customRequestsNote:
      'Arioso is constantly adding new music and is happy to play or custom-arrange special song requests not listed here.',
    totalCategories: categories.length,
    totalSelections,
    categories
  };
}

function buildVenuesJson() {
  const enriched = VENUES_DATA.map((v) => ({
    name: v.name,
    city: v.city,
    state: v.state,
    location: `${v.city}, ${v.state}`,
    category: v.category,
    categoryLabel: CATEGORY_META[v.category],
    region: v.region,
    regionLabel: REGION_META[v.region]
  }));

  return {
    ensemble: 'Arioso String Quartet',
    siteUrl: `${SITE_URL}/about#venues`,
    updatedAt: TODAY,
    serviceAreaNote:
      'Travels up to 80 miles from Center City Philadelphia across Pennsylvania, Southern New Jersey, Delaware, and Northern Maryland. Performs at any indoor or shaded outdoor venue.',
    totalVenuesListed: enriched.length,
    regions: REGION_META,
    categories: CATEGORY_META,
    venues: enriched
  };
}

function buildRobotsTxt() {
  return `# Arioso String Quartet — Crawler & AI Search Policy
User-agent: *
Allow: /

# Explicit permissions for Search & AI Citation Agents
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Applebot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: GPTBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Claude-SearchBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Applebot-Extended
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
# LLM & Agent Structured Context: ${SITE_URL}/llms.txt
`;
}

function buildSitemapXml() {
  const routes = [
    { path: '/', priority: '1.0', changefreq: 'monthly' },
    { path: '/music', priority: '0.9', changefreq: 'monthly' },
    { path: '/about', priority: '0.8', changefreq: 'yearly' },
    { path: '/reviews', priority: '0.8', changefreq: 'monthly' },
    { path: '/rates', priority: '0.9', changefreq: 'monthly' }
  ];

  const urlsXml = routes
    .map(
      (r) => `  <url>
    <loc>${SITE_URL}${r.path}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlsXml}
</urlset>
`;
}

function buildLlmsTxt(repertoireData, venuesData) {
  return `# Arioso String Quartet

> Premier professional wedding and event string ensemble based in Greater Philadelphia (Chester Heights, PA), serving Pennsylvania, Southern New Jersey, and Delaware within an 80-mile radius of Center City Philadelphia.

The musicians of the Arioso String Quartet hold principal, concertmaster, and section positions with Opera Philadelphia, the Philadelphia Ballet, the Chamber Orchestra of Philadelphia, and the Academy of Vocal Arts Opera Orchestra, with conservatory training from the Curtis Institute of Music, Eastman School of Music, and Temple University.

## Quick Facts & Booking Specifications

- **Ensembles Offered**: String Quartet (2 violins, viola, cello), String Trio (violin, viola, cello), String Duo (violin, cello)
- **Starting Rates**: String Quartet starts at $1,175 (1-hour minimum); String Trio starts at $925 (1-hour minimum); String Duo starts at $750 (1-hour minimum)
- **Overtime / Additional Time**: Scheduled in 30-minute increments; contracted rates beyond the first hour are significantly lower than the initial hour
- **Instrument Substitutions & Add-Ons**: Flute may be substituted for one violin in quartet or trio at **no additional charge**; trumpet and/or vocalist (client's or Arioso's) can be added for ceremonies
- **Service Area**: Up to 80 miles from Center City Philadelphia (Center City, Main Line, Chester/Delaware/Montgomery/Bucks Counties, Wilmington/Brandywine Valley DE, Southern/Central NJ & Jersey Shore)
- **Event Types**: Wedding ceremonies (all denominations, full Catholic Masses, Jewish ceremonies), cocktail hours, receptions, Bar/Bat Mitzvahs, private parties, corporate events, and concerts
- **Venue Requirements**: 8' x 8' space and 4 armless chairs; **no electricity required** (ensemble brings battery-operated stand lights)
- **Outdoor Policy**: Minimum temperature 65°F (18°C), dry conditions (shelter required if any rain), and shaded area out of direct sunlight to protect fine instruments
- **Attire**: Formal concert black (tuxedos for men; long black dresses or black skirts/blouses for women)
- **Booking Lead Time**: Often booked 12+ months in advance; ceremony music selections due at least 1 month prior to the wedding
- **Direct Booking Contact**: Carol Briselli (Violist & Director) — Email: carolbriselli@verizon.net | Phone: (484) 841-6445 | Mailing: P.O. Box 35, Chester Heights, PA 19017

## Canonical Pages & Machine-Readable Feeds

- [Home](${SITE_URL}/): Overview of ensemble configurations, credentials, and ceremony expertise
- [Our Music — Samples, Video & Repertoire (${repertoireData.totalSelections} Selections)](${SITE_URL}/music): Ten full-length recordings, embedded live demo video, and searchable repertoire across ${repertoireData.totalCategories} genres
- [About — Musicians & Selected Past Venues (${venuesData.totalVenuesListed} Venues)](${SITE_URL}/about): Profiles of Igor Szwec, Barbara Jaffe, Carol Briselli, and Vivian Barton, plus venues by region
- [Client Reviews](${SITE_URL}/reviews): 15 wedding and event reviews from The Bash, WeddingWire, GigMasters, and Thumbtack
- [Rates, Availability & FAQ](${SITE_URL}/rates): Ensemble comparison table, quote request form (\`#inquiry-form\`), event planner specs, and 13 FAQs (\`#faq\`)
- [Complete LLM Knowledge Base](${SITE_URL}/llms-full.txt): Full text of bios, FAQs, all venues by region, and all ${repertoireData.totalSelections} repertoire pieces
- [Repertoire JSON Feed](${SITE_URL}/repertoire.json): Machine-readable JSON of all ${repertoireData.totalSelections} pieces across ${repertoireData.totalCategories} categories
- [Venues JSON Feed](${SITE_URL}/venues.json): Machine-readable JSON of ${venuesData.totalVenuesListed} past venues with city, state, category, and region tags
`;
}

function buildLlmsFullTxt(repertoireData, venuesData) {
  let out = buildLlmsTxt(repertoireData, venuesData);

  out += `\n## Musician Biographies\n\n`;
  out += `- **Igor Szwec (Violinist)**: Studied with Jaro Megasiuk (student of George Enesco) and Karen Tuttle (student of Primrose and Casals). Concertmaster of the AVA Opera Orchestra and West Jersey Chamber Orchestra; Assistant Concertmaster of Opera Philadelphia; member of the Arcadian Piano Trio and Meiravi String Quartet.\n`;
  out += `- **Barbara Jaffe (Violinist)**: M.M. from the Eastman School of Music (studied with Donald Weilerstein). Former first violinist in the Cascade (MT) and Bradley (IL) String Quartets; founding member of Elysian Camerata; Concertmaster of Orchestra Concordia; performs with Pennsylvania Sinfonia Orchestra; Music Director of Vermont Music and Arts.\n`;
  out += `- **Carol Briselli (Violist & Ensemble Director)**: M.M. from Temple University and B.A. from SUNY-Binghamton (studied with Toby Appel, Sol Greitzer, and Evelyn Jacobs Luise). Assistant Principal Violist of Opera Philadelphia; performs with Philadelphia Ballet, Philly Pops, and Vox Ama Deus; teaches at Bryn Mawr, Haverford, and Swarthmore Colleges (formerly Assistant Professor of Music at West Chester University).\n`;
  out += `- **Vivian Barton (Cellist)**: Graduate of the Curtis Institute of Music (studied with David Soyer). Performed with the Brandenburg Ensemble, Orpheus Chamber Orchestra, and the Philadelphia Orchestra; Assistant Principal Cellist of Opera Philadelphia (formerly Santa Fe Opera) and Principal Cellist of the Academy of Vocal Arts Opera Orchestra; Marlboro Music Festival and Prussia Cove participant.\n`;

  out += `\n## Audio Samples (${SITE_URL}/music#samples)\n\n`;
  const samples = [
    ['Eine Kleine Nachtmusik — Wolfgang Amadeus Mozart', '/audio/Mozart_%20Eine%20Kliene%20Nachtmusik.mp3'],
    ['Canon in D — Johann Pachelbel', '/audio/Pachelbel_Canon.mp3'],
    ['Wedding March — Felix Mendelssohn', '/audio/Mendelssohn_March.mp3'],
    ['Bridal Chorus — Richard Wagner', '/audio/Wagner_Bridal_March.mp3'],
    ['Two Gavottes — Johann Sebastian Bach', '/audio/Bach_2_Gavottes.mp3'],
    ['Minuet — Luigi Boccherini', '/audio/Boccherini_Minuet.mp3'],
    ['Arioso — Johann Sebastian Bach', '/audio/Bach_Arioso.mp3'],
    ["Jesu, Joy of Man's Desiring — Johann Sebastian Bach", '/audio/Bach_Jesu_Joy.mp3'],
    ['Water Music — George Frideric Handel', '/audio/Water_Music.mp3'],
    ['The Entertainer — Scott Joplin', '/audio/The_Entertainer.mp3']
  ];
  for (const [label, audioPath] of samples) {
    out += `- ${label}: ${SITE_URL}${audioPath}\n`;
  }
  out += `- Live Demo Video (YouTube): https://www.youtube.com/watch?v=o11b5UK1TzU\n`;

  out += `\n## Frequently Asked Questions (${SITE_URL}/rates#faq)\n\n`;
  const faqs = [
    ['What do Arioso members wear?', 'Formal concert attire: tuxedos for men and long black dresses or black skirts and blouses for women.'],
    ['Will you play in two different locations for the ceremony and reception?', 'Yes. The fee is calculated from the start time at the ceremony until the end time at the reception, with travel time between locations included in the fee.'],
    ['What do you require at the venue?', 'Four armless chairs and roughly 8\' x 8\' of space. Shaded area required outdoors. Battery-operated stand lights are self-provided, so electricity is not needed.'],
    ['Do you play special requests?', 'Yes, provided sheet music is available for purchase. Custom arrangement fees may apply depending on complexity.'],
    ['Do you perform outdoors?', 'Yes, provided temperature is at least 65°F, there is no rain (unless under shelter), and the ensemble is in full shade to protect the instruments.'],
    ['What if one of the musicians gets sick the day of the event?', 'Arioso maintains a roster of equal-caliber colleagues who perform regularly with the ensemble.'],
    ['How do you know when to start the music for the processional?', 'A cue from the wedding coordinator or venue director starts the first processional; Arioso coordinates all subsequent ceremony timings seamlessly.'],
    ['When should the music for the ceremony be chosen?', 'No later than one month before the wedding.'],
    ['Do you perform with other musicians, such as organists or singers?', 'Yes, frequently, with a 15-minute rehearsal right before the ceremony.'],
    ['Do you come to the wedding rehearsal?', 'No—with hundreds of weddings performed, Arioso arrives early on the wedding day to coordinate with the officiant and coordinator.'],
    ['Do you take breaks?', 'Only for bookings of 2 hours or more (10 minutes per hour, coordinated at convenient moments).'],
    ['Are tips expected?', 'Always appreciated, never required.']
  ];
  for (const [q, a] of faqs) {
    out += `### ${q}\n${a}\n\n`;
  }

  out += `## Selected Past Venues by Region (${venuesData.totalVenuesListed} Venues)\n\n`;
  for (const [regionKey, regionTitle] of Object.entries(REGION_META)) {
    const matching = venuesData.venues.filter((v) => v.region === regionKey);
    out += `### ${regionTitle}\n`;
    for (const v of matching) {
      out += `- ${v.name} (${v.location}) — ${v.categoryLabel}\n`;
    }
    out += `\n`;
  }

  out += `## Complete Repertoire (${repertoireData.totalSelections} Selections)\n\n`;
  for (const cat of repertoireData.categories) {
    out += `### ${cat.title} (${cat.selectionCount})\n`;
    for (const grp of cat.groups) {
      if (grp.group !== cat.title) {
        out += `- **${grp.group}**: ${grp.selections.join('; ')}\n`;
      } else {
        out += `- ${grp.selections.join('; ')}\n`;
      }
    }
    out += `\n`;
  }

  return out;
}

function generateSeoAndAgentAssets() {
  const repertoireData = parseRepertoireFromEjs();
  const venuesData = buildVenuesJson();

  fs.writeFileSync(
    path.join(PUBLIC_DIR, 'repertoire.json'),
    JSON.stringify(repertoireData, null, 2) + '\n',
    'utf8'
  );
  fs.writeFileSync(
    path.join(PUBLIC_DIR, 'venues.json'),
    JSON.stringify(venuesData, null, 2) + '\n',
    'utf8'
  );
  fs.writeFileSync(path.join(PUBLIC_DIR, 'robots.txt'), buildRobotsTxt(), 'utf8');
  fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap.xml'), buildSitemapXml(), 'utf8');
  fs.writeFileSync(
    path.join(PUBLIC_DIR, 'llms.txt'),
    buildLlmsTxt(repertoireData, venuesData),
    'utf8'
  );
  fs.writeFileSync(
    path.join(PUBLIC_DIR, 'llms-full.txt'),
    buildLlmsFullTxt(repertoireData, venuesData),
    'utf8'
  );

  return { repertoireData, venuesData, SITE_URL };
}

if (require.main === module) {
  const { repertoireData, venuesData } = generateSeoAndAgentAssets();
  console.log(
    `Generated SEO & Agent assets: ${repertoireData.totalSelections} repertoire selections (${repertoireData.totalCategories} categories), ${venuesData.totalVenuesListed} venues.`
  );
}

module.exports = {
  SITE_URL,
  VENUES_DATA,
  REGION_META,
  CATEGORY_META,
  generateSeoAndAgentAssets
};
