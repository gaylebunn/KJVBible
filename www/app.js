/**
 * KJV Bible Reader - Application Logic
 * Inspired by Jesus Christ our Lord and Savior
 */

// --- Application State ---
const state = {
  bibleData: null,
  crossReferences: null,
  namesDictionary: null,     // Dictionary of biblical names and Hebrew meanings
  chapterSummaries: null,    // Database of Bible chapter summaries
  bookSummaries: null,       // Database of Bible book summaries
  doreIllustrations: null,   // Database of Gustave Doré illustrations
  activeVisualIndex: 0,      // Active index for multi-image visuals carousel
  lastVisualBookIndex: null, // Tracker for last rendered book in visuals tab
  lastVisualChapterIndex: null, // Tracker for last rendered chapter in visuals tab
  activeCrossRefVerse: null, // Coordinates string of current verse for cross refs (e.g. "0_0_0")
  currentBookIndex: 0,       // Default: Genesis
  currentChapterIndex: 0,    // Default: Chapter 1
  selectedVerseIndex: null,   // Currently active verse for context menu
  viewMode: 'verse',         // 'verse' or 'paragraph'
  fontSize: 100,             // percentage
  theme: 'light',            // 'light', 'parchment', 'dark', 'crimson', 'olive', 'sapphire', 'transfiguration', 'geneva'
  bookmarks: [],             // Array of bookmark objects
  highlights: {},            // Key: "bookIdx_chapIdx_verseIdx", Value: color ('yellow', 'green', 'blue')
  notes: {},                 // Key: "bookIdx_chapIdx_verseIdx", Value: { text: "...", date: "ISO..." }
  searchQuery: '',
  searchFilterTestament: 'all',
  searchFilterBook: 'all',
  searchExactPhrase: false,
  searchCaseSensitive: false,
  biblicalPlaces: null,
  selectedPlaceId: null,
  activeMapType: 'world'
};

// --- Book Groupings and Categories ---
const bookCategories = {
  // Old Testament
  "gn": { category: "Pentateuch", testament: "ot" },
  "ex": { category: "Pentateuch", testament: "ot" },
  "lv": { category: "Pentateuch", testament: "ot" },
  "nm": { category: "Pentateuch", testament: "ot" },
  "dt": { category: "Pentateuch", testament: "ot" },
  "js": { category: "Historical", testament: "ot" },
  "jud": { category: "Historical", testament: "ot" },
  "rt": { category: "Historical", testament: "ot" },
  "1sm": { category: "Historical", testament: "ot" },
  "2sm": { category: "Historical", testament: "ot" },
  "1kgs": { category: "Historical", testament: "ot" },
  "2kgs": { category: "Historical", testament: "ot" },
  "1ch": { category: "Historical", testament: "ot" },
  "2ch": { category: "Historical", testament: "ot" },
  "ezr": { category: "Historical", testament: "ot" },
  "ne": { category: "Historical", testament: "ot" },
  "et": { category: "Historical", testament: "ot" },
  "job": { category: "Poetry & Wisdom", testament: "ot" },
  "ps": { category: "Poetry & Wisdom", testament: "ot" },
  "prv": { category: "Poetry & Wisdom", testament: "ot" },
  "ec": { category: "Poetry & Wisdom", testament: "ot" },
  "so": { category: "Poetry & Wisdom", testament: "ot" },
  "is": { category: "Prophets (Major)", testament: "ot" },
  "jr": { category: "Prophets (Major)", testament: "ot" },
  "lm": { category: "Prophets (Major)", testament: "ot" },
  "ez": { category: "Prophets (Major)", testament: "ot" },
  "dn": { category: "Prophets (Major)", testament: "ot" },
  "ho": { category: "Prophets (Minor)", testament: "ot" },
  "jl": { category: "Prophets (Minor)", testament: "ot" },
  "am": { category: "Prophets (Minor)", testament: "ot" },
  "ob": { category: "Prophets (Minor)", testament: "ot" },
  "jn": { category: "Prophets (Minor)", testament: "ot" },
  "mi": { category: "Prophets (Minor)", testament: "ot" },
  "na": { category: "Prophets (Minor)", testament: "ot" },
  "hk": { category: "Prophets (Minor)", testament: "ot" },
  "zp": { category: "Prophets (Minor)", testament: "ot" },
  "hg": { category: "Prophets (Minor)", testament: "ot" },
  "zc": { category: "Prophets (Minor)", testament: "ot" },
  "ml": { category: "Prophets (Minor)", testament: "ot" },
  // New Testament
  "mt": { category: "Gospels", testament: "nt" },
  "mk": { category: "Gospels", testament: "nt" },
  "lk": { category: "Gospels", testament: "nt" },
  "jo": { category: "Gospels", testament: "nt" },
  "act": { category: "History", testament: "nt" },
  "rm": { category: "Pauline Epistles", testament: "nt" },
  "1co": { category: "Pauline Epistles", testament: "nt" },
  "2co": { category: "Pauline Epistles", testament: "nt" },
  "gl": { category: "Pauline Epistles", testament: "nt" },
  "eph": { category: "Pauline Epistles", testament: "nt" },
  "ph": { category: "Pauline Epistles", testament: "nt" },
  "cl": { category: "Pauline Epistles", testament: "nt" },
  "1ts": { category: "Pauline Epistles", testament: "nt" },
  "2ts": { category: "Pauline Epistles", testament: "nt" },
  "1tm": { category: "Pauline Epistles", testament: "nt" },
  "2tm": { category: "Pauline Epistles", testament: "nt" },
  "tt": { category: "Pauline Epistles", testament: "nt" },
  "phm": { category: "Pauline Epistles", testament: "nt" },
  "hb": { category: "Pauline Epistles", testament: "nt" },
  "jm": { category: "General Epistles", testament: "nt" },
  "1pe": { category: "General Epistles", testament: "nt" },
  "2pe": { category: "General Epistles", testament: "nt" },
  "1jo": { category: "General Epistles", testament: "nt" },
  "2jo": { category: "General Epistles", testament: "nt" },
  "3jo": { category: "General Epistles", testament: "nt" },
  "jd": { category: "General Epistles", testament: "nt" },
  "re": { category: "Prophecy", testament: "nt" }
};

// --- Christ-Centered Daily Devotions ---
const devotions = [
  {
    ref: "John 3:16",
    bookId: "jo", chapter: 3, verse: 16,
    text: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.",
    reflection: "This single verse is the crown jewel of the Gospel. It declares that salvation is rooted in God's love, accomplished by the sacrifice of His Son, Jesus Christ, and received through simple faith. There is nothing you can do to earn this love; it is a free gift. Rest in His promise of eternal life today."
  },
  {
    ref: "John 14:6",
    bookId: "jo", chapter: 14, verse: 6,
    text: "Jesus saith unto him, I am the way, the truth, and the life: no man cometh unto the Father, but by me.",
    reflection: "In a world of shifting values and confusing paths, Jesus makes an exclusive and comforting claim. He is not merely a guide showing the way; He is the Way. He does not just teach truth; He is the Truth. He does not just promise life; He is the Life. In Him, we find access to the Father."
  },
  {
    ref: "Matthew 11:28",
    bookId: "mt", chapter: 11, verse: 28,
    text: "Come unto me, all ye that labour and are heavy laden, and I will give you rest.",
    reflection: "Are you exhausted by the pressures of life, expectations, or the weight of sin? Jesus offers an invitation: 'Come unto me.' He doesn't give a checklist of rules; He gives Himself as our rest. Bring Him your heavy loads today; His yoke is easy and His burden is light."
  },
  {
    ref: "Romans 5:8",
    bookId: "rm", chapter: 5, verse: 8,
    text: "But God commendeth his love toward us, in that, while we were yet sinners, Christ died for us.",
    reflection: "God did not wait for us to clean up our lives before He loved us. Christ died for us while we were at our worst—rebellious, broken, and lost in sin. This is the absolute proof of grace: a Savior dying for His enemies to make them His friends."
  },
  {
    ref: "Ephesians 2:8-9",
    bookId: "eph", chapter: 2, verse: 8,
    text: "For by grace are ye saved through faith; and that not of yourselves: it is the gift of God: Not of works, lest any man should boast.",
    reflection: "Your salvation is entirely a work of God's grace. It is not a paycheck for good behavior, but a gift of divine love. Through faith in Jesus Christ, you receive full forgiveness. Take time to thank God today for the gift of grace, which humbles our pride and secures our souls."
  },
  {
    ref: "John 8:12",
    bookId: "jo", chapter: 8, verse: 12,
    text: "Then spake Jesus again unto them, saying, I am the light of the world: he that followeth me shall not walk in darkness, but shall have the light of life.",
    reflection: "Walking in darkness brings fear, stumbling, and confusion. Jesus proclaims that He is the Light of the World. By following Him—trusting His Word and walking in His paths—our lives are illuminated. The darkness of sin, despair, and death is scattered by His glorious light."
  },
  {
    ref: "Hebrews 12:2",
    bookId: "hb", chapter: 12, verse: 2,
    text: "Looking unto Jesus the author and finisher of our faith; who for the joy that was set before him endured the cross, despising the shame, and is set down at the right hand of the throne of God.",
    reflection: "Keep your eyes on Jesus! He is the one who began your faith journey and He is the one who will complete it. What was the 'joy set before him' that carried Him through the agony of the cross? It was you! It was the joy of redeeming you. Set your mind on Him as you run your race today."
  },
  {
    ref: "Acts 4:12",
    bookId: "act", chapter: 4, verse: 12,
    text: "Neither is there salvation in any other: for there is none other name under heaven given among men, whereby we must be saved.",
    reflection: "The name of Jesus holds supreme authority and saving power. He is the unique Savior of mankind. In Him alone, we find redemption, reconciliation with God, and security. Speak His name in prayer today with confidence and adoration."
  },
  {
    ref: "Philippians 2:9-11",
    bookId: "ph", chapter: 2, verse: 9,
    text: "Wherefore God also hath highly exalted him, and given him a name which is above every name: That at the name of Jesus every knee should bow... And that every tongue should confess that Jesus Christ is Lord, to the glory of God the Father.",
    reflection: "Jesus, who humbled Himself to the death of the cross, is now crowned with glory and honor. He holds the name above all names. One day, the entire creation will acknowledge His sovereignty. Let us gladly bow our hearts to Him today as our Lord and King."
  },
  {
    ref: "Revelation 22:13",
    bookId: "re", chapter: 22, verse: 13,
    text: "I am Alpha and Omega, the beginning and the end, the first and the last.",
    reflection: "Jesus is sovereign over all history and eternity. He was there before the creation of the world, and He holds the future in His hands. Whatever you are facing, remember that the One who started a good work in you is the One who will bring it to its glorious conclusion. He is the first and the last."
  }
];

// --- Message from God Daily Messages ---
const dailyMessages = [
  {
    ref: "Jeremiah 29:11",
    bookId: "jr", chapter: 29, verse: 11,
    text: "For I know the thoughts that I think toward you, saith the Lord, thoughts of peace, and not of evil, to give you an expected end.",
    reflection: "No matter what uncertainty you face, {name}, remember that God has a master plan for your life. His plans are not to harm you, but to give you hope, peace, and a bright future. Trust His timing today."
  },
  {
    ref: "Joshua 1:9",
    bookId: "js", chapter: 1, verse: 9,
    text: "Have not I commanded thee? Be strong and of a good courage; be not afraid, neither be thou dismayed: for the Lord thy God is with thee whithersoever thou goest.",
    reflection: "Be courageous today, {name}! You do not walk alone. Wherever your feet take you, the Lord is standing right beside you. Carry His strength into every task and fear nothing."
  },
  {
    ref: "Isaiah 41:10",
    bookId: "is", chapter: 41, verse: 10,
    text: "Fear thou not; for I am with thee: be not dismayed; for I am thy God: I will strengthen thee; yea, I will help thee; yea, I will uphold thee with the right hand of my righteousness.",
    reflection: "When you feel weak or overwhelmed, {name}, remember that God's own righteous hand is holding you up. Rest in His strength rather than relying on your own."
  },
  {
    ref: "Philippians 4:6",
    bookId: "ph", chapter: 4, verse: 6,
    text: "Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God.",
    reflection: "Take a deep breath, {name}. Hand over every anxiety and worry to God in prayer. In return, He promises to guard your heart with a peace that surpasses all human understanding."
  },
  {
    ref: "Romans 8:28",
    bookId: "rm", chapter: 8, verse: 28,
    text: "And we know that all things work together for good to them that love God, to them who are the called according to his purpose.",
    reflection: "Even when things seem chaotic or disappointing, {name}, God is weaving every thread of your life into a beautiful masterpiece. Trust that He is working all things for your ultimate good."
  },
  {
    ref: "Proverbs 3:5",
    bookId: "prv", chapter: 3, verse: 5,
    text: "Trust in the Lord with all thine heart; and lean not unto thine own understanding.",
    reflection: "You don't have to figure everything out on your own, {name}. Put your full trust in the Lord today, yield your plans to Him, and watch Him clear the path before you."
  },
  {
    ref: "Psalm 23:1",
    bookId: "ps", chapter: 23, verse: 1,
    text: "The Lord is my shepherd; I shall not want.",
    reflection: "As your Shepherd, {name}, the Lord ensures you have everything you truly need. Let Him lead you to quiet pastures today, restoring your soul and giving you rest."
  },
  {
    ref: "Romans 8:39",
    bookId: "rm", chapter: 8, verse: 39,
    text: "Nor height, nor depth, nor any other creature, shall be able to separate us from the love of God, which is in Christ Jesus our Lord.",
    reflection: "Never doubt your worth, {name}. Nothing you do, and nothing that happens to you, can ever separate you from God's immense, unconditional love."
  },
  {
    ref: "Isaiah 40:31",
    bookId: "is", chapter: 40, verse: 31,
    text: "But they that wait upon the Lord shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint.",
    reflection: "If you feel tired or weary, {name}, take time to wait quietly on the Lord today. He will renew your energy and lift you above your circumstances like an eagle."
  },
  {
    ref: "Matthew 6:33",
    bookId: "mt", chapter: 6, verse: 33,
    text: "But seek ye first the kingdom of God, and his righteousness; and all these things shall be added unto you.",
    reflection: "Keep first things first, {name}. Focus your heart on seeking God's kingdom and living righteously, and trust Him to provide for all your daily practical needs."
  },
  {
    ref: "Psalm 46:1",
    bookId: "ps", chapter: 46, verse: 1,
    text: "God is our refuge and strength, a very present help in trouble.",
    reflection: "When life gets stormy, {name}, God is your safe sanctuary. He is not distant; He is a very present help, ready to shield and strengthen you right now."
  },
  {
    ref: "Philippians 4:13",
    bookId: "ph", chapter: 4, verse: 13,
    text: "I can do all things through Christ which strengtheneth me.",
    reflection: "You are capable of overcoming any challenge today, {name}, because the living Christ is infusing you with His strength. Step forward with bold confidence."
  },
  {
    ref: "Romans 15:13",
    bookId: "rm", chapter: 15, verse: 13,
    text: "Now the God of hope fill you with all joy and peace in believing, that ye may abound in hope, through the power of the Holy Ghost.",
    reflection: "May your heart overflow with absolute joy, peace, and hope today, {name}, as you rest your trust in the Lord. Let the Holy Spirit fill your soul."
  },
  {
    ref: "Deuteronomy 31:6",
    bookId: "dt", chapter: 31, verse: 6,
    text: "Be strong and of a good courage, fear not, nor be afraid of them: for the Lord thy God, he it is that doth go with thee; he will not fail thee, nor forsake thee.",
    reflection: "Stand firm, {name}. God goes with you into every battle. He is completely faithful; He will never let you down, nor will He ever abandon you."
  },
  {
    ref: "John 14:27",
    bookId: "jo", chapter: 14, verse: 27,
    text: "Peace I leave with you, my peace I give unto you: not as the world giveth, give I unto you. Let not your heart be troubled, neither let it be afraid.",
    reflection: "Receive the peace of Jesus Christ today, {name}. Unlike the fragile peace of the world, His peace is permanent and unshakable. Let your heart be calm and free from fear."
  },
  {
    ref: "Psalm 37:4",
    bookId: "ps", chapter: 37, verse: 4,
    text: "Delight thyself also in the Lord; and he shall give thee the desires of thine heart.",
    reflection: "Find your ultimate happiness in the Lord, {name}. When your heart delights in His presence, your desires align with His, and He rejoices to fulfill them."
  },
  {
    ref: "Isaiah 26:3",
    bookId: "is", chapter: 26, verse: 3,
    text: "Thou wilt keep him in perfect peace, whose mind is stayed on thee: because he trusteth in thee.",
    reflection: "Focus your thoughts on God today, {name}. When your mind is anchored in His promises rather than the noise of the world, you will experience His perfect, constant peace."
  },
  {
    ref: "Lamentations 3:22",
    bookId: "lm", chapter: 3, verse: 22,
    text: "It is of the Lord's mercies that we are not consumed, because his compassions fail not.",
    reflection: "Every sunrise brings a fresh batch of God's mercies and compassions for you, {name}. No matter what happened yesterday, today is a clean slate under His great faithfulness."
  },
  {
    ref: "Hebrews 11:1",
    bookId: "hb", chapter: 11, verse: 1,
    text: "Now faith is the substance of things hoped for, the evidence of things not seen.",
    reflection: "Walk by faith today, {name}. Trust that God is working behind the scenes on your behalf, even when you cannot see the evidence or know the outcome yet."
  },
  {
    ref: "Psalm 121:2",
    bookId: "ps", chapter: 121, verse: 2,
    text: "My help cometh from the Lord, which made heaven and earth.",
    reflection: "Lift your eyes up when you face difficulties, {name}. The Creator of the heavens and the earth is your personal helper. He never slumbers and is always watching over you."
  },
  {
    ref: "Galatians 6:9",
    bookId: "gl", chapter: 6, verse: 9,
    text: "And let us not be weary in well doing: for in due season we shall reap, if we faint not.",
    reflection: "Do not give up, {name}! Your acts of kindness, faith, and hard work are never in vain. Keep doing good, and you will reap a beautiful harvest in God's perfect timing."
  },
  {
    ref: "1 Peter 5:7",
    bookId: "1pe", chapter: 5, verse: 7,
    text: "Casting all your care upon him; for he careth for you.",
    reflection: "You weren't meant to carry the weight of the world, {name}. Cast every single anxiety, care, and worry onto God's shoulders, because He cares for you deeply and tenderly."
  },
  {
    ref: "James 1:5",
    bookId: "jm", chapter: 1, verse: 5,
    text: "If any of you lack wisdom, let him ask of God, that giveth to all men liberally, and upbraideth not; and it shall be given him.",
    reflection: "If you're facing a tough decision today, {name}, ask God for guidance. He promises to give you wisdom generously and without judgment."
  },
  {
    ref: "2 Timothy 1:7",
    bookId: "2tm", chapter: 1, verse: 7,
    text: "For God hath not given us the spirit of fear; but of power, and of love, and of a sound mind.",
    reflection: "Fear does not come from God, {name}. He has filled you with His Spirit of power, love, and a calm, sound mind. Step forward in authority and peace."
  },
  {
    ref: "Psalm 34:18",
    bookId: "ps", chapter: 34, verse: 18,
    text: "The Lord is nigh unto them that are of a broken heart; and saveth such as be of a contrite spirit.",
    reflection: "If your heart is hurting today, {name}, know that God is closer to you than ever. He sits beside you in your pain, offering comfort, healing, and salvation."
  },
  {
    ref: "Exodus 14:14",
    bookId: "ex", chapter: 14, verse: 14,
    text: "The Lord shall fight for you, and ye shall hold your peace.",
    reflection: "You don't need to stress or force outcomes, {name}. Be still and trust that the Lord is fighting your battles on your behalf. Quietness is your strength today."
  },
  {
    ref: "Zephaniah 3:17",
    bookId: "zp", chapter: 3, verse: 17,
    text: "The Lord thy God in the midst of thee is mighty; he will save, he will rejoice over thee with joy; he will rest in his love, he will joy over thee with singing.",
    reflection: "Just think of this, {name}: the Almighty God is with you, rejoicing over you with gladness and singing songs of joy over your life. Let His love quiet your heart."
  },
  {
    ref: "Psalm 91:2",
    bookId: "ps", chapter: 91, verse: 2,
    text: "I will say of the Lord, He is my refuge and my fortress: my God; in him will I trust.",
    reflection: "Declare God as your protector today, {name}. In Him, you have a solid fortress that no storm can break. Feel secure under His shadow."
  },
  {
    ref: "Romans 8:31",
    bookId: "rm", chapter: 8, verse: 31,
    text: "What shall we then say to these things? If God be for us, who can be against us?",
    reflection: "Remember this powerful truth, {name}: the ultimate Creator of the universe is 100% on your side. With His backing, no opposition or obstacle can stand against you."
  },
  {
    ref: "Isaiah 43:1",
    bookId: "is", chapter: 43, verse: 1,
    text: "Fear not: for I have redeemed thee, I have called thee by thy name; thou art mine.",
    reflection: "You belong to God, {name}. He knows your name and has redeemed you. Walk in the comfort of knowing that you are His precious possession."
  },
  {
    ref: "John 15:9",
    bookId: "jo", chapter: 15, verse: 9,
    text: "As the Father hath loved me, so have I loved you: continue ye in my love.",
    reflection: "Jesus loves you with the very same perfect, deep love that the Father has for Him, {name}. Abide in that love today, letting it wash away all fear."
  }
];

// --- Names and Titles of Jesus Christ ---
const jesusNames = [
  { name: "Alpha and Omega", ref: "Revelation 22:13", bookId: "re", chapter: 22, verse: 13, meaning: "The First and the Last, the beginning and end of all things." },
  { name: "Bread of Life", ref: "John 6:35", bookId: "jo", chapter: 6, verse: 35, meaning: "The ultimate spiritual nourishment that satisfies our soul's hunger forever." },
  { name: "Light of the World", ref: "John 8:12", bookId: "jo", chapter: 8, verse: 12, meaning: "The one who dispels spiritual darkness and guides us in truth." },
  { name: "Good Shepherd", ref: "John 10:11", bookId: "jo", chapter: 10, verse: 11, meaning: "The caring guide who lays down His life for His sheep." },
  { name: "Resurrection and the Life", ref: "John 11:25", bookId: "jo", chapter: 11, verse: 25, meaning: "The conqueror of death who grants eternal life to believers." },
  { name: "Way, Truth, and Life", ref: "John 14:6", bookId: "jo", chapter: 14, verse: 6, meaning: "The only mediator and path to God the Father." },
  { name: "Emmanuel", ref: "Matthew 1:23", bookId: "mt", chapter: 1, verse: 23, meaning: "A name meaning 'God with us', representing Christ's incarnation." },
  { name: "Lamb of God", ref: "John 1:29", bookId: "jo", chapter: 1, verse: 29, meaning: "The perfect sacrifice who takes away the sin of the world." },
  { name: "Prince of Peace", ref: "Isaiah 9:6", bookId: "is", chapter: 9, verse: 6, meaning: "The sovereign ruler who brings reconciliation and tranquility." },
  { name: "King of Kings", ref: "Revelation 19:16", bookId: "re", chapter: 19, verse: 16, meaning: "The supreme ruler over all earthly authorities and kingdoms." },
  { name: "Wonderful Counselor", ref: "Isaiah 9:6", bookId: "is", chapter: 9, verse: 6, meaning: "The source of divine wisdom, understanding, and guidance." },
  { name: "The Word", ref: "John 1:1", bookId: "jo", chapter: 1, verse: 1, meaning: "The eternal expression of God, who became flesh." },
  { name: "Chief Corner Stone", ref: "Ephesians 2:20", bookId: "eph", chapter: 2, verse: 20, meaning: "The foundation upon which the church is built." },
  { name: "Lion of the Tribe of Judah", ref: "Revelation 5:5", bookId: "re", chapter: 5, verse: 5, meaning: "The victorious, strong ruler from the lineage of Jacob." },
  { name: "Bright and Morning Star", ref: "Revelation 22:16", bookId: "re", chapter: 22, verse: 16, meaning: "The herald of a new day, promising His return." },
  { name: "Mediator", ref: "1 Timothy 2:5", bookId: "1tm", chapter: 2, verse: 5, meaning: "The one who reconciles sinful mankind with a Holy God." }
];

// --- Life of Christ Visual Timeline Events ---
const timelineEvents = [
  {
    phase: "prophecy",
    phaseTag: "Prophecy & Birth",
    title: "The Prophecy of Bethlehem",
    desc: "The prophet Micah foretells that the Messiah, whose goings forth have been from of old, from everlasting, will be born in Bethlehem Ephratah.",
    ref: "Micah 5:2",
    bookId: "mi",
    chapter: 5,
    verse: 2,
    icon: "fa-scroll"
  },
  {
    phase: "prophecy",
    phaseTag: "Prophecy & Birth",
    title: "The Annunciation to Mary",
    desc: "The angel Gabriel visits Mary in Nazareth, declaring that she will conceive by the Holy Ghost and bear a Son named Jesus, who will reign forever.",
    ref: "Luke 1:31",
    bookId: "lk",
    chapter: 1,
    verse: 31,
    icon: "fa-dove"
  },
  {
    phase: "prophecy",
    phaseTag: "Prophecy & Birth",
    title: "The Birth of Jesus Christ",
    desc: "Mary gives birth to her firstborn Son in Bethlehem, wraps Him in swaddling clothes, and lays Him in a manger because there was no room in the inn.",
    ref: "Luke 2:7",
    bookId: "lk",
    chapter: 2,
    verse: 7,
    icon: "fa-baby"
  },
  {
    phase: "prophecy",
    phaseTag: "Prophecy & Birth",
    title: "The Visit of the Wise Men",
    desc: "Wise men from the East follow a miraculous star to Bethlehem, worship the young child Jesus, and present Him with gold, frankincense, and myrrh.",
    ref: "Matthew 2:11",
    bookId: "mt",
    chapter: 2,
    verse: 11,
    icon: "fa-crown"
  },
  {
    phase: "early-life",
    phaseTag: "Early Life",
    title: "Jesus in the Temple at Age Twelve",
    desc: "Found sitting in the temple among the doctors, listening and asking questions, young Jesus declares: 'wist ye not that I must be about my Father's business?'",
    ref: "Luke 2:49",
    bookId: "lk",
    chapter: 2,
    verse: 49,
    icon: "fa-child"
  },
  {
    phase: "early-life",
    phaseTag: "Early Life",
    title: "The Baptism of Jesus",
    desc: "John the Baptist baptizes Jesus in the River Jordan. The heavens open, the Spirit of God descends like a dove, and a voice from heaven declares His sonship.",
    ref: "Matthew 3:16",
    bookId: "mt",
    chapter: 3,
    verse: 16,
    icon: "fa-water"
  },
  {
    phase: "early-life",
    phaseTag: "Early Life",
    title: "The Temptation in the Wilderness",
    desc: "Jesus is led by the Spirit into the wilderness, where He fasts for forty days and overcomes the temptations of Satan by citing scripture.",
    ref: "Matthew 4:1",
    bookId: "mt",
    chapter: 4,
    verse: 1,
    icon: "fa-mountain"
  },
  {
    phase: "ministry",
    phaseTag: "Ministry & Miracles",
    title: "The First Miracle at Cana",
    desc: "At a wedding feast in Cana of Galilee, Jesus turns water into fine wine, manifesting His glory and prompting His disciples to believe in Him.",
    ref: "John 2:11",
    bookId: "jo",
    chapter: 2,
    verse: 11,
    icon: "fa-wine-glass"
  },
  {
    phase: "ministry",
    phaseTag: "Ministry & Miracles",
    title: "Cleansing of the Temple Court",
    desc: "Jesus casts out the moneychangers and merchandise sellers from the temple court, declaring: 'make not my Father's house an house of merchandise.'",
    ref: "John 2:15",
    bookId: "jo",
    chapter: 2,
    verse: 15,
    icon: "fa-hand-fist"
  },
  {
    phase: "ministry",
    phaseTag: "Ministry & Miracles",
    title: "Calming the Raging Storm",
    desc: "Awoken by His fearful disciples during a storm on the Sea of Galilee, Jesus rebukes the wind and commands the sea: 'Peace, be still.'",
    ref: "Mark 4:39",
    bookId: "mk",
    chapter: 4,
    verse: 39,
    icon: "fa-wind"
  },
  {
    phase: "ministry",
    phaseTag: "Ministry & Miracles",
    title: "Feeding the Five Thousand",
    desc: "Using only five loaves of bread and two small fishes, Jesus feeds a crowd of five thousand men, beside women and children, with twelve baskets of fragments left over.",
    ref: "Matthew 14:19",
    bookId: "mt",
    chapter: 14,
    verse: 19,
    icon: "fa-bread-slice"
  },
  {
    phase: "ministry",
    phaseTag: "Ministry & Miracles",
    title: "The Transfiguration",
    desc: "Jesus takes Peter, James, and John up a high mountain, where He is transfigured, His face shining like the sun, and Moses and Elijah appear speaking with Him.",
    ref: "Matthew 17:2",
    bookId: "mt",
    chapter: 17,
    verse: 2,
    icon: "fa-sun"
  },
  {
    phase: "teachings",
    phaseTag: "Teachings & Parables",
    title: "The Sermon on the Mount",
    desc: "Jesus ascends a mountain and delivers His core moral and ethical teachings, starting with the Beatitudes and instructing His followers to be the light of the world.",
    ref: "Matthew 5:3",
    bookId: "mt",
    chapter: 5,
    verse: 3,
    icon: "fa-book-open"
  },
  {
    phase: "teachings",
    phaseTag: "Teachings & Parables",
    title: "Parable of the Good Samaritan",
    desc: "Jesus teaches that true neighborly love transcends social barriers, telling the story of a Samaritan who cares for a beaten traveler ignored by others.",
    ref: "Luke 10:33",
    bookId: "lk",
    chapter: 10,
    verse: 33,
    icon: "fa-hand-holding-heart"
  },
  {
    phase: "teachings",
    phaseTag: "Teachings & Parables",
    title: "Parable of the Prodigal Son",
    desc: "Illustrating the depth of God's grace and forgiveness, Jesus tells the story of a loving father who celebrates the return of his wayward, repentant son.",
    ref: "Luke 15:20",
    bookId: "lk",
    chapter: 15,
    verse: 20,
    icon: "fa-hands-holding"
  },
  {
    phase: "passion",
    phaseTag: "Passion Week",
    title: "The Triumphal Entry",
    desc: "Jesus enters Jerusalem riding on a donkey as the crowds lay their cloaks and palm branches on the road, crying: 'Hosanna to the son of David!'",
    ref: "Matthew 21:9",
    bookId: "mt",
    chapter: 21,
    verse: 9,
    icon: "fa-leaf"
  },
  {
    phase: "passion",
    phaseTag: "Passion Week",
    title: "Institution of the Lord's Supper",
    desc: "At the Last Supper, Jesus breaks bread and shares the cup with His disciples, initiating the New Covenant in His body and blood.",
    ref: "Luke 22:19",
    bookId: "lk",
    chapter: 22,
    verse: 19,
    icon: "fa-wine-bottle"
  },
  {
    phase: "passion",
    phaseTag: "Passion Week",
    title: "The Crucifixion of Christ",
    desc: "Jesus is crucified at Golgotha between two thieves. After declaring 'It is finished,' He bows His head and yields up His spirit as the sacrifice for our sins.",
    ref: "John 19:30",
    bookId: "jo",
    chapter: 19,
    verse: 30,
    icon: "fa-cross"
  },
  {
    phase: "resurrection",
    phaseTag: "Resurrection & Ascension",
    title: "The Resurrection: Empty Tomb",
    desc: "On the third day, women visit the tomb and find the stone rolled away. Angels announce: 'He is not here, but is risen,' proving His victory over death.",
    ref: "Luke 24:6",
    bookId: "lk",
    chapter: 24,
    verse: 6,
    icon: "fa-door-open"
  },
  {
    phase: "resurrection",
    phaseTag: "Resurrection & Ascension",
    title: "The Great Commission",
    desc: "Meeting His disciples in Galilee, the risen Lord charges them: 'Go ye therefore, and teach all nations, baptizing them... and, lo, I am with you alway.'",
    ref: "Matthew 28:19",
    bookId: "mt",
    chapter: 28,
    verse: 19,
    icon: "fa-globe"
  },
  {
    phase: "resurrection",
    phaseTag: "Resurrection & Ascension",
    title: "The Ascension to Heaven",
    desc: "On the Mount of Olives, as the apostles look on, Jesus is taken up into heaven, and a cloud receives Him out of their sight to reign at the right hand of God.",
    ref: "Acts 1:9",
    bookId: "act",
    chapter: 1,
    verse: 9,
    icon: "fa-cloud"
  }
];

// --- DOM Element Cache ---
const DOM = {
  btnToggleSidebar: document.getElementById('btn-toggle-sidebar'),
  sidebarLeft: document.getElementById('sidebar-left'),
  bookList: document.getElementById('book-list'),
  bookSearch: document.getElementById('book-search'),
  locationDisplay: document.getElementById('location-display'),
  currentBookName: document.getElementById('current-book-name'),
  currentChapterNum: document.getElementById('current-chapter-num'),
  chapterSelectorGrid: document.getElementById('chapter-selector-grid'),
  chaptersListNums: document.getElementById('chapters-list-nums'),
  btnPrevChapter: document.getElementById('btn-prev-chapter'),
  btnNextChapter: document.getElementById('btn-next-chapter'),
  readerScrollContainer: document.getElementById('reader-scroll-container'),
  bibleChapterTitle: document.getElementById('bible-chapter-title'),
  bibleVersDisplay: document.getElementById('bible-verses-display'),
  sidebarRight: document.getElementById('sidebar-right'),
  btnToggleStudy: document.getElementById('btn-toggle-study'),
  btnCloseStudy: document.getElementById('btn-close-study'),
  studyTabBtns: document.querySelectorAll('.study-tab-btn'),
  studyTabPanes: document.querySelectorAll('.study-tab-pane'),
  bookmarksList: document.getElementById('bookmarks-list-container'),
  highlightsList: document.getElementById('highlights-list-container'),
  notesList: document.getElementById('notes-list-container'),
  notesSearch: document.getElementById('notes-search'),
  noteEditorContainer: document.getElementById('note-editor-container'),
  notesListView: document.getElementById('notes-list-view'),
  noteEditorVerseTitle: document.getElementById('note-editor-verse-title'),
  noteEditorVerseText: document.getElementById('note-editor-verse-text'),
  noteEditorTextarea: document.getElementById('note-editor-textarea'),
  btnSaveNote: document.getElementById('btn-save-note'),
  btnCancelNote: document.getElementById('btn-cancel-note'),
  btnCloseNoteEditor: document.getElementById('btn-close-note-editor'),
  menuNote: document.getElementById('menu-note'),
  btnBackupRestoreTrigger: document.getElementById('btn-backup-restore-trigger'),
  backupModal: document.getElementById('backup-modal'),
  btnCloseBackup: document.getElementById('btn-close-backup'),
  btnExportData: document.getElementById('btn-export-data'),
  importFileInput: document.getElementById('import-file-input'),
  btnSelectImportFile: document.getElementById('btn-select-import-file'),
  importFilename: document.getElementById('import-filename'),
  btnClearAllData: document.getElementById('btn-clear-all-data'),
  jesusNamesList: document.getElementById('jesus-names-list'),
  btnNewDevotional: document.getElementById('btn-new-devotional'),
  btnMessageGod: document.getElementById('btn-message-god'),
  messageGodModal: document.getElementById('message-god-modal'),
  btnCloseMessageGod: document.getElementById('btn-close-message-god'),
  msgNameInputView: document.getElementById('msg-name-input-view'),
  msgContentView: document.getElementById('msg-content-view'),
  msgUserName: document.getElementById('msg-user-name'),
  btnSubmitMsgName: document.getElementById('btn-submit-msg-name'),
  msgGreeting: document.getElementById('msg-greeting'),
  msgVerseText: document.getElementById('msg-verse-text'),
  msgVerseRef: document.getElementById('msg-verse-ref'),
  msgReflection: document.getElementById('msg-reflection'),
  btnMsgGoToVerse: document.getElementById('btn-msg-go-to-verse'),
  btnMsgSaveNote: document.getElementById('btn-msg-save-note'),
  btnMsgCreateCard: document.getElementById('btn-msg-create-card'),
  btnMsgResetName: document.getElementById('btn-msg-reset-name'),
  devVerseText: document.getElementById('dev-verse-text'),
  devVerseRef: document.getElementById('dev-verse-ref'),
  devReflectionText: document.getElementById('dev-reflection-text'),
  btnOpenSearch: document.getElementById('btn-open-search'),
  btnCloseSearch: document.getElementById('btn-close-search'),
  searchModalContainer: document.getElementById('search-modal-container'),
  searchInput: document.getElementById('search-input'),
  searchFilterTestament: document.getElementById('search-filter-testament'),
  searchFilterBook: document.getElementById('search-filter-book'),
  searchExactPhrase: document.getElementById('search-exact-phrase'),
  searchCaseSensitive: document.getElementById('search-case-sensitive'),
  searchStatusText: document.getElementById('search-status-text'),
  searchResultsContainer: document.getElementById('search-results-container'),
  gospelModal: document.getElementById('gospel-modal'),
  btnGospelTrigger: document.getElementById('btn-gospel-trigger'),
  btnCloseGospel: document.getElementById('btn-close-gospel'),
  timelineModal: document.getElementById('timeline-modal'),
  btnTimelineTrigger: document.getElementById('btn-timeline-trigger'),
  btnCloseTimeline: document.getElementById('btn-close-timeline'),
  timelineContainer: document.getElementById('timeline-events-container'),
  btnToggleView: document.getElementById('btn-toggle-view'),
  fontDec: document.getElementById('font-dec'),
  fontInc: document.getElementById('font-inc'),
  fontSizeVal: document.getElementById('font-size-val'),
  themeDots: document.querySelectorAll('.theme-dot'),
  verseContextMenu: document.getElementById('verse-context-menu'),
  menuBookmark: document.getElementById('menu-bookmark'),
  menuCopy: document.getElementById('menu-copy'),
  menuShare: document.getElementById('menu-share'),
  menuCrossrefs: document.getElementById('menu-crossrefs'),
  menuCard: document.getElementById('menu-card'),
  cardModal: document.getElementById('card-modal-container'),
  btnCloseCard: document.getElementById('btn-close-card'),
  btnCancelCard: document.getElementById('btn-cancel-card'),
  btnDownloadCard: document.getElementById('btn-download-card'),
  cardCanvas: document.getElementById('card-preview-canvas'),
  cardFontSize: document.getElementById('card-font-size'),
  cardFontSizeVal: document.getElementById('card-font-size-val'),
  cardFontFamily: document.getElementById('card-font-family'),
  cardTextEdit: document.getElementById('card-verse-text-edit'),
  cardToggleQuotes: document.getElementById('card-toggle-quotes'),
  cardToggleBorder: document.getElementById('card-toggle-border'),
  cardToggleWatermark: document.getElementById('card-toggle-watermark'),
  bgSwatchesList: document.getElementById('bg-swatches-list'),
  colorDots: document.querySelectorAll('.color-dot'),
  crossRefsList: document.getElementById('cross-refs-list-container'),
  crossRefsActiveVerseTitle: document.getElementById('cross-refs-active-verse-title'),
  nameTooltip: document.getElementById('name-tooltip'),
  nameTooltipTitle: document.getElementById('name-tooltip-title'),
  nameTooltipMeaning: document.getElementById('name-tooltip-meaning'),
  btnSearchNameOccurrences: document.getElementById('btn-search-name-occurrences'),
  chapterSummaryPanel: document.getElementById('chapter-summary-panel'),
  bookSummaryTitle: document.getElementById('book-summary-title'),
  bookSummaryContent: document.getElementById('book-summary-content'),
  chapterSummaryTitle: document.getElementById('chapter-summary-title'),
  chapterSummaryContent: document.getElementById('chapter-summary-content'),
  btnToggleSummaryCollapse: document.getElementById('btn-toggle-summary-collapse'),
  visualsContainer: document.getElementById('visuals-container'),
  imageViewerModal: document.getElementById('image-viewer-modal'),
  imageViewerImg: document.getElementById('image-viewer-img'),
  imageViewerTitle: document.getElementById('image-viewer-title'),
  imageViewerRef: document.getElementById('image-viewer-ref'),
  btnCloseImageViewer: document.getElementById('btn-close-image-viewer'),
  mapSvgContainer: document.getElementById('map-svg-container'),
  mapInfoPanel: document.getElementById('map-info-panel'),
  mapPlacesSearch: document.getElementById('map-places-search'),
  mapPlacesList: document.getElementById('map-places-list'),
  mapSelectorButtons: document.querySelectorAll('.map-sel-btn')
};

// --- Initialization & Setup ---
document.addEventListener('DOMContentLoaded', async () => {
  // Load State from LocalStorage
  loadStateFromStorage();
  
  // Fetch Bible JSON Data and Cross References
  try {
    const response = await fetch('kjv.json');
    state.bibleData = await response.json();
    
    try {
      const crossRefsResponse = await fetch('cross_references.json');
      state.crossReferences = await crossRefsResponse.json();
      console.log('Cross-references loaded successfully.');
    } catch (e) {
      console.warn("Could not load cross-references database:", e);
    }

    try {
      const namesResponse = await fetch('names_dictionary.json');
      state.namesDictionary = await namesResponse.json();
      console.log('Names dictionary loaded successfully.');
    } catch (e) {
      console.warn("Could not load names dictionary database:", e);
    }

    try {
      const summariesResponse = await fetch('chapter_summaries.json');
      state.chapterSummaries = await summariesResponse.json();
      console.log('Chapter summaries loaded successfully.');
      updateChapterSummary();
    } catch (e) {
      console.warn("Could not load chapter summaries database:", e);
      if (DOM.chapterSummaryContent) {
        DOM.chapterSummaryContent.textContent = "Could not load chapter summaries.";
      }
    }

    try {
      const bookSummariesResponse = await fetch('book_summaries.json');
      state.bookSummaries = await bookSummariesResponse.json();
      console.log('Book summaries loaded successfully.');
      updateBookSummary();
    } catch (e) {
      console.warn("Could not load book summaries database:", e);
      if (DOM.bookSummaryContent) {
        DOM.bookSummaryContent.textContent = "Could not load book summaries.";
      }
    }

    try {
      const doreResponse = await fetch('dore_illustrations.json');
      state.doreIllustrations = await doreResponse.json();
      console.log('Dore illustrations database loaded successfully.');
      // updateVisualsTab() will be called during initial renderCurrentChapter() if loaded, or here if loaded later
      updateVisualsTab();
    } catch (e) {
      console.warn("Could not load Dore illustrations database:", e);
    }

    try {
      const placesResponse = await fetch('biblical_places.json');
      state.biblicalPlaces = await placesResponse.json();
      console.log('Biblical places database loaded successfully.');
      updateMapsTab();
    } catch (e) {
      console.warn("Could not load biblical places database:", e);
    }
    
    // Initialize UI Elements
    initBookSidebar();
    initSearchFilterBooks();
    initJesusNames();
    initResizablePanels();
    initCardCreator();
    initTimeline();
    initMapsTab();
    
    // Load Chapter
    renderCurrentChapter();
    
    // Register Global Events
    registerEventListeners();
  } catch (error) {
    console.error("Error loading KJV Bible database:", error);
    DOM.bibleVersDisplay.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-triangle-exclamation empty-state-icon" style="color: var(--red-letter);"></i>
        <p>Could not load the Bible text. Please ensure 'kjv.json' is in the workspace directory and accessible.</p>
      </div>
    `;
  }
});

// --- State Storage Helpers ---
function loadStateFromStorage() {
  const bookmarks = localStorage.getItem('kjv_bookmarks');
  if (bookmarks) state.bookmarks = JSON.parse(bookmarks);

  const highlights = localStorage.getItem('kjv_highlights');
  if (highlights) state.highlights = JSON.parse(highlights);

  const notes = localStorage.getItem('kjv_notes');
  if (notes) state.notes = JSON.parse(notes);
  else state.notes = {};

  const theme = localStorage.getItem('kjv_theme');
  if (theme) {
    state.theme = theme;
    document.body.setAttribute('data-theme', theme);
    DOM.themeDots.forEach(dot => {
      dot.classList.toggle('active', dot.getAttribute('data-theme') === theme);
    });
  }

  const fontSize = localStorage.getItem('kjv_fontSize');
  if (fontSize) {
    state.fontSize = parseInt(fontSize);
    applyFontSize();
  }

  const viewMode = localStorage.getItem('kjv_viewMode');
  if (viewMode) {
    state.viewMode = viewMode;
    applyViewModeIcon();
  }
  const currentLoc = localStorage.getItem('kjv_current_loc');
  if (currentLoc) {
    const loc = JSON.parse(currentLoc);
    state.currentBookIndex = loc.bookIdx;
    state.currentChapterIndex = loc.chapterIdx;
  }

  const summaryCollapsed = localStorage.getItem('kjv_summary_collapsed');
  if (summaryCollapsed === 'true') {
    if (DOM.chapterSummaryPanel) {
      DOM.chapterSummaryPanel.classList.add('collapsed');
    }
  }
}

function saveCurrentLocation() {
  localStorage.setItem('kjv_current_loc', JSON.stringify({
    bookIdx: state.currentBookIndex,
    chapterIdx: state.currentChapterIndex
  }));
}

// --- Book Sidebar Setup ---
function initBookSidebar() {
  renderBookList();
  
  // Search filter inside sidebar
  DOM.bookSearch.addEventListener('input', () => {
    renderBookList();
  });
  
  // Testament filtering buttons
  document.getElementById('btn-testament-all').addEventListener('click', (e) => {
    toggleTestamentFilter(e.target, 'all');
  });
  document.getElementById('btn-testament-ot').addEventListener('click', (e) => {
    toggleTestamentFilter(e.target, 'ot');
  });
  document.getElementById('btn-testament-nt').addEventListener('click', (e) => {
    toggleTestamentFilter(e.target, 'nt');
  });
}

let activeTestamentFilter = 'all';
function toggleTestamentFilter(activeBtn, testament) {
  document.querySelectorAll('.testament-btn').forEach(btn => btn.classList.remove('active'));
  activeBtn.classList.add('active');
  activeTestamentFilter = testament;
  renderBookList();
}

function renderBookList() {
  DOM.bookList.innerHTML = '';
  const searchVal = DOM.bookSearch.value.toLowerCase();
  
  let currentGroup = '';
  
  state.bibleData.forEach((book, index) => {
    const meta = bookCategories[book.id];
    
    // Apply testament filter
    if (activeTestamentFilter !== 'all' && meta.testament !== activeTestamentFilter) {
      return;
    }
    
    // Apply search filter
    if (searchVal && !book.name.toLowerCase().includes(searchVal) && !book.id.toLowerCase().includes(searchVal)) {
      return;
    }
    
    // Add Category Header
    if (meta.category !== currentGroup) {
      currentGroup = meta.category;
      const grpHeader = document.createElement('div');
      grpHeader.className = 'book-group-title';
      grpHeader.innerText = currentGroup;
      DOM.bookList.appendChild(grpHeader);
    }
    
    // Create Book Item
    const bookItem = document.createElement('div');
    bookItem.className = `book-item ${index === state.currentBookIndex ? 'active' : ''}`;
    bookItem.innerHTML = `
      <span>${book.name}</span>
      <span class="book-item-chapters">${book.chapters.length} Chs</span>
    `;
    
    bookItem.addEventListener('click', () => {
      selectBook(index);
    });
    
    DOM.bookList.appendChild(bookItem);
  });
}

function selectBook(index) {
  state.currentBookIndex = index;
  state.currentChapterIndex = 0;
  
  // Update sidebar active classes
  document.querySelectorAll('.book-item').forEach(el => el.classList.remove('active'));
  renderBookList();
  
  // Load chapter
  renderCurrentChapter();
  saveCurrentLocation();
  
  // Close chapter selector grid if open
  DOM.chapterSelectorGrid.style.display = 'none';
}

// --- Search Filter Options ---
function initSearchFilterBooks() {
  DOM.searchFilterBook.innerHTML = '<option value="all">All Books</option>';
  state.bibleData.forEach((book, index) => {
    const opt = document.createElement('option');
    opt.value = index;
    opt.innerText = book.name;
    DOM.searchFilterBook.appendChild(opt);
  });
}

// --- Names of Jesus Interactive List ---
function initJesusNames() {
  DOM.jesusNamesList.innerHTML = '';
  
  jesusNames.forEach(item => {
    const card = document.createElement('div');
    card.className = 'name-card';
    card.innerHTML = `
      <div class="name-title">${item.name}</div>
      <div class="name-meaning">${item.meaning}</div>
      <div class="name-reference">${item.ref}</div>
    `;
    
    card.addEventListener('click', () => {
      // Find book index
      const bookIdx = state.bibleData.findIndex(b => b.id === item.bookId);
      if (bookIdx !== -1) {
        navigateToScripture(bookIdx, item.chapter - 1, item.verse - 1);
        
        // If drawer is mobile-absolute, close it
        if (window.innerWidth <= 1024) {
          DOM.sidebarRight.classList.add('study-drawer-collapsed');
        }
      }
    });
    
    DOM.jesusNamesList.appendChild(card);
  });
}

// --- Navigation helper ---
function navigateToScripture(bookIdx, chapterIdx, verseIdx) {
  state.currentBookIndex = bookIdx;
  state.currentChapterIndex = chapterIdx;
  
  renderCurrentChapter();
  saveCurrentLocation();
  renderBookList();
  
  // Scroll to verse and flash it
  setTimeout(() => {
    const verseElement = document.querySelector(`.bible-verse[data-verse-idx="${verseIdx}"]`);
    if (verseElement) {
      verseElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Flash highlight visual
      verseElement.style.outline = '2px solid var(--accent-color)';
      verseElement.style.transition = 'outline 0.3s ease';
      setTimeout(() => {
        verseElement.style.outline = 'none';
      }, 2000);
    }
  }, 300);
}

// --- Render Chapter & Verses ---
function renderCurrentChapter() {
  if (!state.bibleData) return;
  
  const book = state.bibleData[state.currentBookIndex];
  const chapterNum = state.currentChapterIndex + 1;
  const verses = book.chapters[state.currentChapterIndex];
  
  // Update header text
  DOM.currentBookName.innerText = book.name;
  DOM.currentChapterNum.innerText = chapterNum;
  DOM.bibleChapterTitle.innerText = `${book.name} ${chapterNum}`;
  
  // Update chapter navigation button states
  DOM.btnPrevChapter.disabled = (state.currentBookIndex === 0 && state.currentChapterIndex === 0);
  DOM.btnNextChapter.disabled = (state.currentBookIndex === state.bibleData.length - 1 && 
                                 state.currentChapterIndex === book.chapters.length - 1);
  
  // Render verses list
  DOM.bibleVersDisplay.innerHTML = '';
  
  // Update parent class for verse / paragraph styling
  if (state.viewMode === 'paragraph') {
    DOM.bibleVersDisplay.className = '';
  } else {
    DOM.bibleVersDisplay.className = 'verse-mode-block';
  }
  
  let currentParagraph = null;
  
  verses.forEach((verseText, verseIndex) => {
    const verseNum = verseIndex + 1;
    
    // Detect paragraph start
    const isParaStart = verseText.includes('*p') || verseText.includes('*rp') || verseText.includes('*sp');
    
    if (state.viewMode === 'paragraph') {
      if (isParaStart || !currentParagraph) {
        currentParagraph = document.createElement('p');
        currentParagraph.className = 'bible-paragraph';
        DOM.bibleVersDisplay.appendChild(currentParagraph);
      }
    }
    
    const verseSpan = document.createElement('span');
    verseSpan.className = 'bible-verse';
    verseSpan.setAttribute('data-verse-idx', verseIndex);
    
    // Check highlight color
    const highlightKey = `${state.currentBookIndex}_${state.currentChapterIndex}_${verseIndex}`;
    const highlightColor = state.highlights[highlightKey];
    if (highlightColor) {
      verseSpan.classList.add(`highlight-${highlightColor}`);
    }
    
    // Check bookmark
    const isBookmarked = state.bookmarks.some(b => 
      b.bookIdx === state.currentBookIndex && 
      b.chapterIdx === state.currentChapterIndex && 
      b.verseIdx === verseIndex
    );
    if (isBookmarked) {
      verseSpan.classList.add('bookmarked');
    }

    // Check note
    const noteKey = `${state.currentBookIndex}_${state.currentChapterIndex}_${verseIndex}`;
    const hasNote = state.notes && state.notes[noteKey] && state.notes[noteKey].text.trim() !== '';
    
    const processedText = formatVerseText(verseText);
    
    // Prepend pilcrow sign if in verse mode and it's a paragraph start
    let prependHtml = '';
    if (state.viewMode === 'verse' && isParaStart) {
      prependHtml = `<span class="paragraph-sign" title="Paragraph Start">¶ </span>`;
    }

    let noteHtml = '';
    if (hasNote) {
      const cleanNoteText = state.notes[noteKey].text.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
      const noteDate = state.notes[noteKey].date ? new Date(state.notes[noteKey].date) : new Date();
      const formattedDate = noteDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
      noteHtml = `<i class="fas fa-file-signature verse-note-icon" style="color: var(--accent-color); margin-right: 0.35rem; font-size: 0.85rem;" title="Note (${formattedDate}): ${cleanNoteText.substring(0, 60)}${cleanNoteText.length > 60 ? '...' : ''}" data-verse-idx="${verseIndex}"></i>`;
    }
    
    verseSpan.innerHTML = `${prependHtml}<span class="verse-num">${verseNum} </span>${noteHtml}${processedText}`;
    
    // Double click to trigger context menu (bookmarks/highlighting)
    verseSpan.addEventListener('dblclick', (e) => {
      e.preventDefault();
      if (e.target.classList.contains('verse-note-icon')) {
        return; // Don't show context menu on note icon double click
      }
      showVerseMenu(e, verseIndex);
      triggerCrossRefsIfActive(verseIndex);
    });
    
    // Click to trigger context menu as well (better for touch screens)
    verseSpan.addEventListener('click', (e) => {
      // If clicked on the note icon, redirect directly to edit note
      if (e.target.classList.contains('verse-note-icon')) {
        e.stopPropagation();
        // Open study drawer if closed
        DOM.sidebarRight.classList.remove('study-drawer-collapsed');
        // Activate the Notes tab
        const notesTabBtn = document.querySelector('.study-tab-btn[data-tab="notes"]');
        if (notesTabBtn) {
          notesTabBtn.click();
        }
        openNoteEditor(state.currentBookIndex, state.currentChapterIndex, parseInt(e.target.getAttribute('data-verse-idx'), 10));
        return;
      }
      showVerseMenu(e, verseIndex);
      triggerCrossRefsIfActive(verseIndex);
    });
    
    if (state.viewMode === 'paragraph') {
      currentParagraph.appendChild(verseSpan);
      currentParagraph.appendChild(document.createTextNode(' '));
    } else {
      DOM.bibleVersDisplay.appendChild(verseSpan);
    }
  });
  
  // Reset scroll position to top of reader
  DOM.readerScrollContainer.scrollTop = 0;
  
  // Update Bookmarks study tab representation
  renderBookmarksList();
  renderHighlightsList();
  renderNotesList();
  
  // Update Cross-Refs if tab is active
  const activeTabBtn = document.querySelector('.study-tab-btn.active');
  if (activeTabBtn && activeTabBtn.getAttribute('data-tab') === 'cross-refs') {
    loadCrossReferencesForVerse(state.currentBookIndex, state.currentChapterIndex, 0);
  }

  // Update Book & Chapter Summaries
  updateBookSummary();
  updateChapterSummary();
  
  // Update Gustave Doré Visuals
  updateVisualsTab();
  
  // Update Maps
  updateMapsTab();
}

// --- Book & Chapter Summary Renderers ---
function updateBookSummary() {
  if (!state.bibleData) return;
  const book = state.bibleData[state.currentBookIndex];
  if (!book) return;
  
  if (DOM.bookSummaryTitle) {
    DOM.bookSummaryTitle.textContent = `${book.name} Summary`;
  }
  
  if (!state.bookSummaries) {
    if (DOM.bookSummaryContent) {
      DOM.bookSummaryContent.textContent = "Loading book summary...";
    }
    return;
  }
  
  const summary = state.bookSummaries[state.currentBookIndex];
  if (summary) {
    if (DOM.bookSummaryContent) {
      DOM.bookSummaryContent.textContent = summary;
    }
  } else {
    if (DOM.bookSummaryContent) {
      DOM.bookSummaryContent.textContent = "No summary available for this book.";
    }
  }
}

function updateChapterSummary() {
  if (!state.bibleData) return;
  const book = state.bibleData[state.currentBookIndex];
  if (!book) return;
  const chapterNum = state.currentChapterIndex + 1;

  if (DOM.chapterSummaryTitle) {
    DOM.chapterSummaryTitle.textContent = `${book.name} ${chapterNum} Summary`;
  }

  if (!state.chapterSummaries) {
    if (DOM.chapterSummaryContent) {
      DOM.chapterSummaryContent.textContent = "Loading chapter summary...";
    }
    return;
  }
  
  const summaries = state.chapterSummaries[state.currentBookIndex];
  if (summaries && summaries[state.currentChapterIndex]) {
    if (DOM.chapterSummaryContent) {
      DOM.chapterSummaryContent.textContent = summaries[state.currentChapterIndex];
    }
  } else {
    if (DOM.chapterSummaryContent) {
      DOM.chapterSummaryContent.textContent = "No summary available for this chapter.";
    }
  }
}

// --- Gustave Doré Bible Visuals Renderer ---
function updateVisualsTab() {
  if (!DOM.visualsContainer) return;

  if (!state.bibleData || !state.doreIllustrations) {
    DOM.visualsContainer.innerHTML = '<div class="visuals-loading" style="padding: 1.5rem; text-align: center; font-style: italic; color: var(--text-secondary);">Loading visuals...</div>';
    return;
  }

  // Reset index if we changed book or chapter
  if (state.lastVisualBookIndex !== state.currentBookIndex || state.lastVisualChapterIndex !== state.currentChapterIndex) {
    state.activeVisualIndex = 0;
    state.lastVisualBookIndex = state.currentBookIndex;
    state.lastVisualChapterIndex = state.currentChapterIndex;
  }

  const book = state.bibleData[state.currentBookIndex];
  const chapterNumStr = String(state.currentChapterIndex + 1);
  const bookName = book.name;

  // Let's see if we have direct illustrations for this chapter
  let illustrations = [];
  let isFallback = false;
  let fallbackChapterNum = null;

  if (state.doreIllustrations[bookName] && state.doreIllustrations[bookName][chapterNumStr]) {
    illustrations = state.doreIllustrations[bookName][chapterNumStr];
  } else {
    // Direct illustrations not found. Let's look for closest chapter in the same book that has illustrations.
    const bookIllustrations = state.doreIllustrations[bookName];
    if (bookIllustrations) {
      const illustratedChapters = Object.keys(bookIllustrations).map(Number).sort((a, b) => a - b);
      if (illustratedChapters.length > 0) {
        const currentChapterNum = state.currentChapterIndex + 1;
        // Find closest
        let closestChapter = illustratedChapters[0];
        let minDiff = Math.abs(currentChapterNum - closestChapter);
        for (let i = 1; i < illustratedChapters.length; i++) {
          const ch = illustratedChapters[i];
          const diff = Math.abs(currentChapterNum - ch);
          if (diff < minDiff) {
            minDiff = diff;
            closestChapter = ch;
          }
        }
        illustrations = bookIllustrations[String(closestChapter)];
        isFallback = true;
        fallbackChapterNum = closestChapter;
      }
    }
  }

  // Clear container first
  DOM.visualsContainer.innerHTML = '';

  // If we found illustrations (direct or fallback)
  if (illustrations && illustrations.length > 0) {
    // Ensure activeVisualIndex is in bounds
    if (state.activeVisualIndex >= illustrations.length) {
      state.activeVisualIndex = 0;
    }

    const cdnBase = 'https://raw.githubusercontent.com/Nainoia-Inc/AionianBible_GustaveDore_LaGrandeBibledeTours/master/';
    
    // Function to render slide/illustration
    const renderIllustration = (index) => {
      const ill = illustrations[index];
      const imgUrl = `${cdnBase}${ill.filename}`;
      const title = ill.title;
      const ref = isFallback ? `${bookName} ${fallbackChapterNum}` : `${bookName} ${chapterNumStr}`;
      
      const badgeHtml = isFallback ? `<div class="visuals-badge"><i class="fas fa-history"></i> Fallback (Ch. ${fallbackChapterNum})</div>` : '';
      
      let carouselControlsHtml = '';
      if (illustrations.length > 1) {
        // Generate dot indicators
        let dotsHtml = '';
        for (let i = 0; i < illustrations.length; i++) {
          dotsHtml += `<span class="visuals-carousel-dot ${i === index ? 'active' : ''}" data-idx="${i}"></span>`;
        }
        
        carouselControlsHtml = `
          <div class="visuals-carousel-nav">
            <button class="visuals-carousel-btn prev-btn" title="Previous Image"><i class="fas fa-chevron-left"></i></button>
            <div class="visuals-carousel-dots">
              ${dotsHtml}
            </div>
            <button class="visuals-carousel-btn next-btn" title="Next Image"><i class="fas fa-chevron-right"></i></button>
          </div>
        `;
      }

      DOM.visualsContainer.innerHTML = `
        <div class="visuals-carousel-container">
          <div class="visuals-card">
            ${badgeHtml}
            <div class="visuals-img-wrapper" id="visuals-img-wrapper" style="margin-top: ${isFallback ? '0.5rem' : '0'}">
              <img class="visuals-img" src="${imgUrl}" alt="${title}" loading="lazy">
            </div>
            <div class="visuals-meta">
              <div class="visuals-title">${title}</div>
              <div class="visuals-caption">${ref} &bull; Plate ${ill.plate}</div>
            </div>
            ${carouselControlsHtml}
          </div>
        </div>
      `;

      // Event listener for click to zoom
      const imgWrapper = DOM.visualsContainer.querySelector('#visuals-img-wrapper');
      if (imgWrapper) {
        imgWrapper.addEventListener('click', () => {
          openFullscreenImage(imgUrl, title, isFallback ? `${bookName} ${chapterNumStr} (Ch. ${fallbackChapterNum} Fallback)` : `${bookName} ${chapterNumStr}`);
        });
      }

      // Event listeners for carousel buttons and dots
      if (illustrations.length > 1) {
        const prevBtn = DOM.visualsContainer.querySelector('.prev-btn');
        const nextBtn = DOM.visualsContainer.querySelector('.next-btn');
        const dots = DOM.visualsContainer.querySelectorAll('.visuals-carousel-dot');

        if (prevBtn) {
          prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            state.activeVisualIndex = (state.activeVisualIndex - 1 + illustrations.length) % illustrations.length;
            renderIllustration(state.activeVisualIndex);
          });
        }

        if (nextBtn) {
          nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            state.activeVisualIndex = (state.activeVisualIndex + 1) % illustrations.length;
            renderIllustration(state.activeVisualIndex);
          });
        }

        dots.forEach(dot => {
          dot.addEventListener('click', (e) => {
            e.stopPropagation();
            const idx = parseInt(dot.getAttribute('data-idx'));
            state.activeVisualIndex = idx;
            renderIllustration(idx);
          });
        });
      }
    };

    renderIllustration(state.activeVisualIndex);

  } else {
    // Scripture card fallback (Zero illustrations in the entire book)
    const verses = book.chapters[state.currentChapterIndex];
    let firstVerseText = "In the beginning...";
    if (verses && verses.length > 0) {
      firstVerseText = getSearchableText(verses[0]);
    }
    
    DOM.visualsContainer.innerHTML = `
      <div class="visuals-fallback-card">
        <div class="visuals-fallback-border">
          <div class="visuals-fallback-text">${firstVerseText}</div>
          <div class="visuals-fallback-ref">${bookName} ${chapterNumStr}:1</div>
        </div>
      </div>
    `;
  }
}

function openFullscreenImage(url, title, ref) {
  if (!DOM.imageViewerModal || !DOM.imageViewerImg) return;
  DOM.imageViewerImg.src = url;
  if (DOM.imageViewerTitle) DOM.imageViewerTitle.textContent = title;
  if (DOM.imageViewerRef) DOM.imageViewerRef.textContent = ref;
  DOM.imageViewerModal.style.display = 'flex';
}

// --- Text Formatting & Red Letter Logic ---
function getSearchableText(text) {
  if (!text) return '';
  // Strip markers like *r, *rp, *s, *sp, *p
  let clean = text.replace(/\*(?:rp|sp|r|p|s)/g, '');
  // Clean translator italics and notes
  clean = clean.replace(/\{([^{}]+)\}/g, (match, content) => {
    if (content.includes(':') || content.startsWith('Heb.') || content.startsWith('Gr.') || content.startsWith('or,')) {
      return '';
    }
    return content;
  });
  return clean.replace(/\s+/g, ' ').trim();
}

function formatVerseText(text) {
  if (!text) return '';
  
  const tokens = text.split(' ');
  const result = [];
  let currentType = null; // 'christ', 'lord', or null
  let buffer = [];
  
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    let type = null;
    if (token.includes('*r') || token.includes('*rp')) {
      type = 'christ';
    } else if (token.includes('*s') || token.includes('*sp')) {
      type = 'lord';
    }
    
    const cleanToken = token.replace(/\*(?:rp|sp|r|p|s)/g, '');
    
    if (type === currentType) {
      buffer.push(cleanToken);
    } else {
      if (buffer.length > 0) {
        if (currentType === 'christ') {
          result.push(`<span class="words-of-christ">${buffer.join(' ')}</span>`);
        } else if (currentType === 'lord') {
          result.push(`<span class="lord-small-caps">${buffer.join(' ')}</span>`);
        } else {
          result.push(buffer.join(' '));
        }
      }
      currentType = type;
      buffer = [cleanToken];
    }
  }
  
  if (buffer.length > 0) {
    if (currentType === 'christ') {
      result.push(`<span class="words-of-christ">${buffer.join(' ')}</span>`);
    } else if (currentType === 'lord') {
      result.push(`<span class="lord-small-caps">${buffer.join(' ')}</span>`);
    } else {
      result.push(buffer.join(' '));
    }
  }
  
  let processedText = result.join(' ');
  
  // Format italics Translations and Translator Notes
  processedText = processedText.replace(/\{([^{}]+)\}/g, (match, content) => {
    if (content.includes(':') || content.startsWith('Heb.') || content.startsWith('Gr.') || content.startsWith('or,')) {
      return `<span class="translator-italics" style="border-bottom: 1px dotted var(--accent-color); cursor: help;" title="Translator Note: ${content}">${content.split(':').pop().trim()}</span>`;
    } else {
      return `<span class="translator-italics">${content}</span>`;
    }
  });
  
  return processedText;
}

// --- Verse Context Menu ---
function showVerseMenu(event, verseIdx) {
  // If the user has selected text, bypass the context menu to show the name tooltip instead
  if (window.getSelection().toString().trim() !== '') {
    return;
  }

  event.stopPropagation();
  state.selectedVerseIndex = verseIdx;
  
  // Show context menu near click
  DOM.verseContextMenu.style.display = 'block';
  
  // Position menu
  const scrollY = window.scrollY;
  const posX = event.clientX;
  const posY = event.clientY + scrollY;
  
  // Prevent menu overflow off right edge of screen
  const menuWidth = 180;
  const screenWidth = window.innerWidth;
  const finalX = (posX + menuWidth > screenWidth) ? screenWidth - menuWidth - 10 : posX;
  
  DOM.verseContextMenu.style.left = `${finalX}px`;
  DOM.verseContextMenu.style.top = `${posY}px`;
  
  // Adjust menu text if verse already bookmarked
  const isBookmarked = state.bookmarks.some(b => 
    b.bookIdx === state.currentBookIndex && 
    b.chapterIdx === state.currentChapterIndex && 
    b.verseIdx === verseIdx
  );
  DOM.menuBookmark.innerHTML = isBookmarked ? 
    '<i class="fas fa-bookmark" style="color: var(--accent-color);"></i> Remove Bookmark' : 
    '<i class="far fa-bookmark"></i> Bookmark';
}

function hideVerseMenu() {
  DOM.verseContextMenu.style.display = 'none';
}

// --- Menu Actions ---
function toggleBookmarkCurrentVerse() {
  if (state.selectedVerseIndex === null) return;
  
  const book = state.bibleData[state.currentBookIndex];
  const chapterNum = state.currentChapterIndex + 1;
  const verseNum = state.selectedVerseIndex + 1;
  const verseText = book.chapters[state.currentChapterIndex][state.selectedVerseIndex];
  
  const index = state.bookmarks.findIndex(b => 
    b.bookIdx === state.currentBookIndex && 
    b.chapterIdx === state.currentChapterIndex && 
    b.verseIdx === state.selectedVerseIndex
  );
  
  if (index !== -1) {
    // Remove bookmark
    state.bookmarks.splice(index, 1);
  } else {
    // Add bookmark
    state.bookmarks.push({
      bookIdx: state.currentBookIndex,
      chapterIdx: state.currentChapterIndex,
      verseIdx: state.selectedVerseIndex,
      bookName: book.name,
      chapterNum: chapterNum,
      verseNum: verseNum,
      text: verseText
    });
  }
  
  localStorage.setItem('kjv_bookmarks', JSON.stringify(state.bookmarks));
  renderCurrentChapter();
  hideVerseMenu();
}

function copyCurrentVerse() {
  if (state.selectedVerseIndex === null) return;
  
  const book = state.bibleData[state.currentBookIndex];
  const chapterNum = state.currentChapterIndex + 1;
  const verseNum = state.selectedVerseIndex + 1;
  const verseText = book.chapters[state.currentChapterIndex][state.selectedVerseIndex];
  
  const cleanText = getSearchableText(verseText);
  const copyString = `"${cleanText}" - ${book.name} ${chapterNum}:${verseNum} (KJV)`;
  
  navigator.clipboard.writeText(copyString).then(() => {
    alert("Verse copied to clipboard!");
  }).catch(err => {
    console.error("Could not copy verse:", err);
  });
  
  hideVerseMenu();
}

function shareCurrentVerse() {
  if (state.selectedVerseIndex === null) return;
  
  const book = state.bibleData[state.currentBookIndex];
  const chapterNum = state.currentChapterIndex + 1;
  const verseNum = state.selectedVerseIndex + 1;
  
  const shareString = `Read ${book.name} ${chapterNum}:${verseNum} in the KJV Bible App.`;
  
  if (navigator.share) {
    navigator.share({
      title: 'KJV Bible Share',
      text: shareString,
      url: window.location.href
    }).catch(err => console.log(err));
  } else {
    navigator.clipboard.writeText(shareString);
    alert("Reference link copied for sharing!");
  }
  
  hideVerseMenu();
}

function highlightCurrentVerse(color) {
  if (state.selectedVerseIndex === null) return;
  
  const key = `${state.currentBookIndex}_${state.currentChapterIndex}_${state.selectedVerseIndex}`;
  
  if (color === 'clear') {
    delete state.highlights[key];
  } else {
    state.highlights[key] = color;
  }
  
  localStorage.setItem('kjv_highlights', JSON.stringify(state.highlights));
  renderCurrentChapter();
  hideVerseMenu();
}

// --- Bookmarks Panel Rendering ---
function renderBookmarksList() {
  DOM.bookmarksList.innerHTML = '';
  
  if (state.bookmarks.length === 0) {
    DOM.bookmarksList.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-bookmark empty-state-icon"></i>
        <p>No bookmarks saved yet.</p>
        <span style="font-size: 0.8rem; opacity: 0.8;">Double click or click a verse in the reader to bookmark or highlight it.</span>
      </div>
    `;
    return;
  }
  
  // Sort bookmarks by book index, then chapter, then verse
  const sorted = [...state.bookmarks].sort((a, b) => {
    if (a.bookIdx !== b.bookIdx) return a.bookIdx - b.bookIdx;
    if (a.chapterIdx !== b.chapterIdx) return a.chapterIdx - b.chapterIdx;
    return a.verseIdx - b.verseIdx;
  });
  
  sorted.forEach(bm => {
    const item = document.createElement('div');
    item.className = 'bookmark-list-item';
    
    const cleanText = getSearchableText(bm.text);
    
    item.innerHTML = `
      <div class="bookmark-location">
        <span>${bm.bookName} ${bm.chapterNum}:${bm.verseNum}</span>
        <button class="bookmark-delete" title="Delete Bookmark"><i class="fas fa-trash-can"></i></button>
      </div>
      <p class="bookmark-text">${cleanText}</p>
    `;
    
    // Go to bookmark on click
    item.querySelector('.bookmark-text').addEventListener('click', () => {
      navigateToScripture(bm.bookIdx, bm.chapterIdx, bm.verseIdx);
    });
    
    // Delete bookmark
    item.querySelector('.bookmark-delete').addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = state.bookmarks.findIndex(b => 
        b.bookIdx === bm.bookIdx && b.chapterIdx === bm.chapterIdx && b.verseIdx === bm.verseIdx
      );
      if (idx !== -1) {
        state.bookmarks.splice(idx, 1);
        localStorage.setItem('kjv_bookmarks', JSON.stringify(state.bookmarks));
        renderBookmarksList();
        renderCurrentChapter();
      }
    });
    
    DOM.bookmarksList.appendChild(item);
  });
}

// --- Highlights Panel Rendering ---
function renderHighlightsList() {
  if (!DOM.highlightsList) return;
  DOM.highlightsList.innerHTML = '';
  
  const keys = Object.keys(state.highlights);
  if (keys.length === 0) {
    DOM.highlightsList.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-highlighter empty-state-icon"></i>
        <p>No highlights saved yet.</p>
        <span style="font-size: 0.8rem; opacity: 0.8;">Double click or click a verse in the reader and select a color to highlight it.</span>
      </div>
    `;
    return;
  }
  
  const items = keys.map(key => {
    const parts = key.split('_');
    const bookIdx = parseInt(parts[0]);
    const chapterIdx = parseInt(parts[1]);
    const verseIdx = parseInt(parts[2]);
    const book = state.bibleData[bookIdx];
    const text = book ? book.chapters[chapterIdx][verseIdx] : '';
    const bookName = book ? book.name : '';
    
    return {
      key,
      bookIdx,
      chapterIdx,
      verseIdx,
      color: state.highlights[key],
      bookName,
      chapterNum: chapterIdx + 1,
      verseNum: verseIdx + 1,
      text
    };
  });
  
  // Sort highlights by book index, then chapter, then verse
  items.sort((a, b) => {
    if (a.bookIdx !== b.bookIdx) return a.bookIdx - b.bookIdx;
    if (a.chapterIdx !== b.chapterIdx) return a.chapterIdx - b.chapterIdx;
    return a.verseIdx - b.verseIdx;
  });
  
  items.forEach(hl => {
    const item = document.createElement('div');
    item.className = `highlight-list-item hl-${hl.color}`;
    
    const cleanText = getSearchableText(hl.text);
    
    item.innerHTML = `
      <div class="bookmark-location">
        <span>${hl.bookName} ${hl.chapterNum}:${hl.verseNum}</span>
        <button class="bookmark-delete" title="Delete Highlight"><i class="fas fa-trash-can"></i></button>
      </div>
      <p class="bookmark-text">${cleanText}</p>
    `;
    
    // Go to highlight on click
    item.querySelector('.bookmark-text').addEventListener('click', () => {
      navigateToScripture(hl.bookIdx, hl.chapterIdx, hl.verseIdx);
    });
    
    // Delete highlight
    item.querySelector('.bookmark-delete').addEventListener('click', (e) => {
      e.stopPropagation();
      delete state.highlights[hl.key];
      localStorage.setItem('kjv_highlights', JSON.stringify(state.highlights));
      renderHighlightsList();
      renderCurrentChapter();
    });
    
    DOM.highlightsList.appendChild(item);
  });
}

// --- Personal Notes Logic ---
let activeEditingNoteKey = null; // Store key of note currently being edited

function renderNotesList() {
  if (!DOM.notesList) return;
  DOM.notesList.innerHTML = '';
  
  const searchVal = DOM.notesSearch ? DOM.notesSearch.value.toLowerCase().trim() : '';
  const noteKeys = Object.keys(state.notes);
  
  // Filter and convert notes to list
  const filteredNotes = [];
  noteKeys.forEach(key => {
    const note = state.notes[key];
    if (!note || !note.text) return;
    
    // Parse key to get book index, chapter index, verse index
    const parts = key.split('_');
    if (parts.length < 3) return;
    const bookIdx = parseInt(parts[0], 10);
    const chapterIdx = parseInt(parts[1], 10);
    const verseIdx = parseInt(parts[2], 10);
    
    const book = state.bibleData ? state.bibleData[bookIdx] : null;
    const bookName = book ? book.name : '';
    const chapterNum = chapterIdx + 1;
    const verseNum = verseIdx + 1;
    const refText = `${bookName} ${chapterNum}:${verseNum}`;
    const verseText = book ? book.chapters[chapterIdx][verseIdx] : '';
    
    // Check search filter
    if (searchVal !== '') {
      const matchText = note.text.toLowerCase().includes(searchVal);
      const matchRef = refText.toLowerCase().includes(searchVal);
      const matchVerse = verseText.toLowerCase().includes(searchVal);
      if (!matchText && !matchRef && !matchVerse) return;
    }
    
    filteredNotes.push({
      key,
      bookIdx,
      chapterIdx,
      verseIdx,
      bookName,
      chapterNum,
      verseNum,
      refText,
      verseText,
      text: note.text,
      date: note.date ? new Date(note.date) : new Date()
    });
  });
  
  // Sort notes: newest first
  filteredNotes.sort((a, b) => b.date - a.date);
  
  if (filteredNotes.length === 0) {
    DOM.notesList.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-pen-to-square empty-state-icon"></i>
        <p>${searchVal !== '' ? 'No matching notes found.' : 'No study notes saved yet.'}</p>
        <span style="font-size: 0.8rem; opacity: 0.8; display: block; margin-top: 0.5rem;">Click any verse and select "Add/Edit Note" to start writing.</span>
      </div>
    `;
    return;
  }
  
  filteredNotes.forEach(itemData => {
    const item = document.createElement('div');
    item.className = 'note-list-item';
    
    const formattedDate = itemData.date.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const cleanVerseText = getSearchableText(itemData.verseText);
    
    item.innerHTML = `
      <div class="note-header">
        <span class="note-ref" title="Go to scripture">${itemData.refText}</span>
        <span class="note-date">${formattedDate}</span>
      </div>
      <p class="note-verse-context" title="${cleanVerseText}">${cleanVerseText}</p>
      <p class="note-text-preview">${escapeHtml(itemData.text)}</p>
      <div class="note-actions">
        <button class="note-action-btn edit-btn" title="Edit Note"><i class="fas fa-pen"></i> Edit</button>
        <button class="note-action-btn delete-btn" title="Delete Note"><i class="fas fa-trash-can"></i> Delete</button>
      </div>
    `;
    
    // Go to verse on reference click
    item.querySelector('.note-ref').addEventListener('click', () => {
      navigateToScripture(itemData.bookIdx, itemData.chapterIdx, itemData.verseIdx);
    });
    
    // Edit action
    item.querySelector('.edit-btn').addEventListener('click', () => {
      openNoteEditor(itemData.bookIdx, itemData.chapterIdx, itemData.verseIdx);
    });
    
    // Delete action
    item.querySelector('.delete-btn').addEventListener('click', () => {
      deleteNote(itemData.key);
    });
    
    DOM.notesList.appendChild(item);
  });
}

function openNoteEditor(bookIdx, chapterIdx, verseIdx) {
  if (!state.bibleData) return;
  
  const book = state.bibleData[bookIdx];
  const chapterNum = chapterIdx + 1;
  const verseNum = verseIdx + 1;
  const verseText = book.chapters[chapterIdx][verseIdx];
  
  const key = `${bookIdx}_${chapterIdx}_${verseIdx}`;
  activeEditingNoteKey = key;
  
  // Update editor DOM elements
  DOM.noteEditorVerseTitle.innerText = `${book.name} ${chapterNum}:${verseNum} Note`;
  DOM.noteEditorVerseText.innerText = `“${getSearchableText(verseText)}”`;
  
  // Load existing note text if any
  const existingNote = state.notes[key];
  DOM.noteEditorTextarea.value = existingNote ? existingNote.text : '';
  
  // Show editor, hide list
  DOM.notesListView.style.display = 'none';
  DOM.noteEditorContainer.style.display = 'block';
  
  // Focus textarea
  setTimeout(() => {
    DOM.noteEditorTextarea.focus();
  }, 100);
}

function closeNoteEditor() {
  activeEditingNoteKey = null;
  DOM.noteEditorContainer.style.display = 'none';
  DOM.notesListView.style.display = 'block';
  renderNotesList();
}

function saveNote() {
  if (!activeEditingNoteKey) return;
  
  const text = DOM.noteEditorTextarea.value.trim();
  
  if (text === '') {
    // If empty text, treat as delete
    delete state.notes[activeEditingNoteKey];
  } else {
    state.notes[activeEditingNoteKey] = {
      text: text,
      date: new Date().toISOString()
    };
  }
  
  localStorage.setItem('kjv_notes', JSON.stringify(state.notes));
  closeNoteEditor();
  renderCurrentChapter();
}

function deleteNote(key) {
  if (confirm('Are you sure you want to delete this study note?')) {
    delete state.notes[key];
    localStorage.setItem('kjv_notes', JSON.stringify(state.notes));
    renderNotesList();
    renderCurrentChapter();
  }
}

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// --- Backup & Restore Logic ---
function openBackupModal() {
  // Reset filename input
  if (DOM.importFilename) DOM.importFilename.innerText = 'No file selected';
  if (DOM.importFileInput) DOM.importFileInput.value = '';
  DOM.backupModal.classList.add('active');
}

function closeBackupModal() {
  DOM.backupModal.classList.remove('active');
}

function exportStudyData() {
  const backupData = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    bookmarks: state.bookmarks || [],
    highlights: state.highlights || {},
    notes: state.notes || {}
  };
  
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `kjv_bible_study_backup_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

function importStudyData(file) {
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      
      // Basic validation
      if (!data || (data.bookmarks === undefined && data.highlights === undefined && data.notes === undefined)) {
        alert('Invalid backup file. Could not find study data.');
        return;
      }
      
      // Merge/overwrite bookmarks
      if (data.bookmarks && Array.isArray(data.bookmarks)) {
        state.bookmarks = data.bookmarks;
        localStorage.setItem('kjv_bookmarks', JSON.stringify(state.bookmarks));
      }
      
      // Merge/overwrite highlights
      if (data.highlights && typeof data.highlights === 'object') {
        state.highlights = data.highlights;
        localStorage.setItem('kjv_highlights', JSON.stringify(state.highlights));
      }
      
      // Merge/overwrite notes
      if (data.notes && typeof data.notes === 'object') {
        state.notes = data.notes;
        localStorage.setItem('kjv_notes', JSON.stringify(state.notes));
      }
      
      alert('Study data successfully imported! The application will now reload to apply changes.');
      location.reload();
      
    } catch (err) {
      alert('Error parsing JSON backup file: ' + err.message);
    }
  };
  reader.readAsText(file);
}

function clearAllStudyData() {
  if (confirm('WARNING: This will permanently delete ALL of your saved bookmarks, highlights, and study notes. Are you sure you want to proceed?')) {
    if (confirm('FINAL WARNING: This action CANNOT be undone. Proceed with reset?')) {
      state.bookmarks = [];
      state.highlights = {};
      state.notes = {};
      
      localStorage.setItem('kjv_bookmarks', JSON.stringify(state.bookmarks));
      localStorage.setItem('kjv_highlights', JSON.stringify(state.highlights));
      localStorage.setItem('kjv_notes', JSON.stringify(state.notes));
      
      alert('All study data has been reset.');
      location.reload();
    }
  }
}

// --- Chapter Select Grid ---
function toggleChapterSelector() {
  if (!state.bibleData) return;
  
  const book = state.bibleData[state.currentBookIndex];
  
  if (DOM.chapterSelectorGrid.style.display === 'block') {
    DOM.chapterSelectorGrid.style.display = 'none';
  } else {
    DOM.chapterSelectorGrid.style.display = 'block';
    DOM.chaptersListNums.innerHTML = '';
    
    book.chapters.forEach((chapter, index) => {
      const btn = document.createElement('div');
      btn.className = `chapter-grid-item ${index === state.currentChapterIndex ? 'active' : ''}`;
      btn.innerText = index + 1;
      
      btn.addEventListener('click', () => {
        state.currentChapterIndex = index;
        DOM.chapterSelectorGrid.style.display = 'none';
        renderCurrentChapter();
        saveCurrentLocation();
      });
      
      DOM.chaptersListNums.appendChild(btn);
    });
  }
}

// --- Devotional Logic ---
function getVerseFromDb(bookId, chapterNum, verseNum) {
  if (!state.bibleData) return '';
  const book = state.bibleData.find(b => b.id === bookId);
  if (!book) return '';
  const chapter = book.chapters[chapterNum - 1];
  if (!chapter) return '';
  return chapter[verseNum - 1] || '';
}

function renderRandomDevotional() {
  const randIdx = Math.floor(Math.random() * devotions.length);
  const dev = devotions[randIdx];
  
  const dbText = getVerseFromDb(dev.bookId, dev.chapter, dev.verse);
  const formattedText = dbText ? formatVerseText(dbText) : dev.text;
  
  DOM.devVerseText.innerHTML = `“${formattedText}”`;
  DOM.devVerseRef.innerText = dev.ref;
  DOM.devReflectionText.innerText = dev.reflection;
  
  // Set listener to jump to passage
  DOM.devVerseRef.onclick = () => {
    const bookIdx = state.bibleData.findIndex(b => b.id === dev.bookId);
    if (bookIdx !== -1) {
      navigateToScripture(bookIdx, dev.chapter - 1, dev.verse - 1);
      
      if (window.innerWidth <= 1024) {
        DOM.sidebarRight.classList.add('study-drawer-collapsed');
      }
    }
  };
}

// --- Message from God Modal Logic ---
let activeDailyMessageRef = null;

function showMessageGodModal() {
  const savedName = localStorage.getItem('kjv_user_name');
  if (savedName) {
    DOM.msgNameInputView.style.display = 'none';
    DOM.msgContentView.style.display = 'block';
    renderDailyMessage(savedName);
  } else {
    DOM.msgNameInputView.style.display = 'block';
    DOM.msgContentView.style.display = 'none';
    DOM.msgUserName.value = '';
  }
  DOM.messageGodModal.classList.add('active');
}

function renderDailyMessage(name) {
  const today = new Date();
  const day = today.getDate(); // 1 to 31
  const messageIdx = (day - 1) % dailyMessages.length;
  const msg = dailyMessages[messageIdx];
  
  activeDailyMessageRef = msg;
  
  // Try to load verse text from KJV database if loaded, else use fallback text
  const dbText = getVerseFromDb(msg.bookId, msg.chapter, msg.verse);
  const formattedText = dbText ? formatVerseText(dbText) : msg.text;
  
  // Format reflection with user's name
  const personalizedReflection = msg.reflection.replace(/{name}/g, name);
  
  DOM.msgGreeting.innerText = `${name}, here is your message from God for today:`;
  DOM.msgVerseText.innerHTML = `“${formattedText}”`;
  DOM.msgVerseRef.innerText = msg.ref;
  DOM.msgReflection.innerText = personalizedReflection;
}

function saveDailyMessageAsNote() {
  if (!activeDailyMessageRef || !state.bibleData) return;
  
  const bookIdx = state.bibleData.findIndex(b => b.id === activeDailyMessageRef.bookId);
  if (bookIdx === -1) return;
  
  const chapterIdx = activeDailyMessageRef.chapter - 1;
  const verseIdx = activeDailyMessageRef.verse - 1;
  const key = `${bookIdx}_${chapterIdx}_${verseIdx}`;
  
  const savedName = localStorage.getItem('kjv_user_name') || 'Friend';
  const personalizedReflection = activeDailyMessageRef.reflection.replace(/{name}/g, savedName);
  const noteBodyText = `Daily Message Reflection:\n${personalizedReflection}`;
  
  state.notes[key] = {
    text: noteBodyText,
    date: new Date().toISOString()
  };
  
  localStorage.setItem('kjv_notes', JSON.stringify(state.notes));
  
  renderCurrentChapter();
  renderNotesList();
  
  if (DOM.btnMsgSaveNote) {
    DOM.btnMsgSaveNote.innerHTML = '<i class="fas fa-check"></i> Note Saved!';
    DOM.btnMsgSaveNote.style.backgroundColor = 'var(--accent-color)';
    DOM.btnMsgSaveNote.style.color = '#fff';
    DOM.btnMsgSaveNote.disabled = true;
    setTimeout(() => {
      DOM.btnMsgSaveNote.innerHTML = '<i class="fas fa-edit"></i> Save Note';
      DOM.btnMsgSaveNote.style.backgroundColor = '';
      DOM.btnMsgSaveNote.style.color = '';
      DOM.btnMsgSaveNote.disabled = false;
    }, 2000);
  }
}

// --- Cross-References Explorer Logic ---
function triggerCrossRefsIfActive(verseIdx) {
  const activeTabBtn = document.querySelector('.study-tab-btn.active');
  if (activeTabBtn && activeTabBtn.getAttribute('data-tab') === 'cross-refs') {
    loadCrossReferencesForVerse(state.currentBookIndex, state.currentChapterIndex, verseIdx);
  }
}

function loadCrossReferencesForVerse(bookIdx, chapterIdx, verseIdx) {
  state.activeCrossRefVerse = `${bookIdx}_${chapterIdx}_${verseIdx}`;
  renderCrossRefsList();
}

function renderCrossRefsList() {
  if (!DOM.crossRefsList) return;
  DOM.crossRefsList.innerHTML = '';
  
  if (!state.activeCrossRefVerse) {
    DOM.crossRefsActiveVerseTitle.innerText = 'No Verse Selected';
    DOM.crossRefsList.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-circle-nodes empty-state-icon"></i>
        <p>Select a verse to explore its cross-references.</p>
        <span style="font-size: 0.8rem; opacity: 0.8; display: block; margin-top: 0.5rem;">Click any verse in the reader and select "Cross-References" from the menu.</span>
      </div>
    `;
    return;
  }
  
  const parts = state.activeCrossRefVerse.split('_');
  const bookIdx = parseInt(parts[0], 10);
  const chapterIdx = parseInt(parts[1], 10);
  const verseIdx = parseInt(parts[2], 10);
  
  const book = state.bibleData[bookIdx];
  const chapterNum = chapterIdx + 1;
  const verseNum = verseIdx + 1;
  
  DOM.crossRefsActiveVerseTitle.innerText = `${book.name} ${chapterNum}:${verseNum}`;
  
  if (!state.crossReferences) {
    DOM.crossRefsList.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-triangle-exclamation empty-state-icon" style="color: var(--red-letter);"></i>
        <p>Cross-references database not loaded.</p>
      </div>
    `;
    return;
  }
  
  const targets = state.crossReferences[state.activeCrossRefVerse];
  
  if (!targets || targets.length === 0) {
    DOM.crossRefsList.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-circle-nodes empty-state-icon" style="opacity: 0.4;"></i>
        <p>No cross-references recorded for this verse.</p>
        <span style="font-size: 0.8rem; opacity: 0.8; display: block; margin-top: 0.5rem;">Try checking another verse (e.g., John 3:16).</span>
      </div>
    `;
    return;
  }
  
  targets.forEach(targetKey => {
    const tParts = targetKey.split('_');
    const tBookIdx = parseInt(tParts[0], 10);
    const tChapIdx = parseInt(tParts[1], 10);
    const tVerseIdx = parseInt(tParts[2], 10);
    
    const tBook = state.bibleData[tBookIdx];
    const tChapNum = tChapIdx + 1;
    const tVerseNum = tVerseIdx + 1;
    const tVerseText = tBook.chapters[tChapIdx][tVerseIdx];
    
    const item = document.createElement('div');
    item.className = 'cross-ref-list-item';
    
    const formattedText = formatVerseText(tVerseText);
    
    item.innerHTML = `
      <div class="cross-ref-location">
        <span>${tBook.name} ${tChapNum}:${tVerseNum}</span>
      </div>
      <p class="cross-ref-text">${formattedText}</p>
    `;
    
    const jumpToRef = () => {
      navigateToScripture(tBookIdx, tChapIdx, tVerseIdx);
      if (window.innerWidth <= 1024) {
        DOM.sidebarRight.classList.add('study-drawer-collapsed');
      }
    };
    
    item.querySelector('.cross-ref-location').addEventListener('click', jumpToRef);
    item.querySelector('.cross-ref-text').addEventListener('click', jumpToRef);
    
    DOM.crossRefsList.appendChild(item);
  });
}

// --- Full Text Search Engine ---
function runSearch() {
  const query = DOM.searchInput.value.trim();
  state.searchQuery = query;
  
  if (!query) {
    DOM.searchResultsContainer.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-search-bible empty-state-icon" style="font-size: 3rem; margin-bottom: 1rem;"></i>
        <p>Enter a query to search the Scriptures.</p>
      </div>
    `;
    DOM.searchStatusText.innerText = "Ready to search.";
    return;
  }
  
  DOM.searchStatusText.innerText = "Searching...";
  DOM.searchResultsContainer.innerHTML = `
    <div class="empty-state">
      <i class="fas fa-spinner fa-spin empty-state-icon"></i>
      <p>Searching the Word...</p>
    </div>
  `;
  
  // Run async search to keep UI responsive
  setTimeout(() => {
    const results = [];
    const testamentFilter = DOM.searchFilterTestament.value;
    const bookFilterVal = DOM.searchFilterBook.value; // 'all' or index
    const isExactPhrase = DOM.searchExactPhrase.checked;
    const isCaseSensitive = DOM.searchCaseSensitive.checked;
    
    const queryRegex = new RegExp(
      isExactPhrase ? escapeRegExp(query) : query.split(/\s+/).map(escapeRegExp).join('|'),
      isCaseSensitive ? 'g' : 'gi'
    );
    
    // Loop through Bible
    state.bibleData.forEach((book, bookIdx) => {
      // Apply book filter
      if (bookFilterVal !== 'all' && parseInt(bookFilterVal) !== bookIdx) {
        return;
      }
      
      // Apply testament filter
      const meta = bookCategories[book.id];
      if (testamentFilter !== 'all' && meta.testament !== testamentFilter) {
        return;
      }
      
      book.chapters.forEach((chapter, chapIdx) => {
        chapter.forEach((verseText, verseIdx) => {
          let matches = false;
          const searchableText = getSearchableText(verseText);
          
          // Case matches check
          if (isExactPhrase) {
            matches = isCaseSensitive ? 
              searchableText.includes(query) : 
              searchableText.toLowerCase().includes(query.toLowerCase());
          } else {
            // Words match
            const words = query.split(/\s+/);
            matches = words.every(word => {
              return isCaseSensitive ? 
                searchableText.includes(word) : 
                searchableText.toLowerCase().includes(word.toLowerCase());
            });
          }
          
          if (matches) {
            results.push({
              bookIdx,
              chapIdx,
              verseIdx,
              bookName: book.name,
              chapNum: chapIdx + 1,
              verseNum: verseIdx + 1,
              text: verseText,
              testament: meta.testament
            });
          }
        });
      });
    });
    
    // Render Results
    renderSearchResults(results, queryRegex);
  }, 50);
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function renderSearchResults(results, queryRegex) {
  DOM.searchResultsContainer.innerHTML = '';
  
  const count = results.length;
  DOM.searchStatusText.innerText = `${count.toLocaleString()} verses found.`;
  
  if (count === 0) {
    DOM.searchResultsContainer.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-face-frown empty-state-icon"></i>
        <p>No results found for "${state.searchQuery}".</p>
        <span style="font-size: 0.85rem; opacity: 0.8;">Try searching for simpler words, or check spelling.</span>
      </div>
    `;
    return;
  }
  
  // Cap displayed results for browser performance
  const displayLimit = 500;
  const displayed = results.slice(0, displayLimit);
  
  if (count > displayLimit) {
    DOM.searchStatusText.innerText = `Showing top ${displayLimit} of ${count.toLocaleString()} matches.`;
  }
  
  displayed.forEach(res => {
    const item = document.createElement('div');
    item.className = 'search-result-item';
    
    // Clean text and highlight matching text
    const cleanText = getSearchableText(res.text);
    
    // Highlight matching keywords
    const highlightedText = cleanText.replace(queryRegex, (match) => {
      return `<span class="search-highlight">${match}</span>`;
    });
    
    item.innerHTML = `
      <div class="search-result-location">
        <span>${res.bookName} ${res.chapNum}:${res.verseNum}</span>
        <span class="search-result-testament">${res.testament === 'ot' ? 'Old' : 'New'}</span>
      </div>
      <p class="search-result-text">${highlightedText}</p>
    `;
    
    // Navigation on click
    item.addEventListener('click', () => {
      DOM.searchModalContainer.classList.remove('active');
      navigateToScripture(res.bookIdx, res.chapIdx, res.verseIdx);
    });
    
    DOM.searchResultsContainer.appendChild(item);
  });
}

// --- Font Size Adjustment ---
function adjustFontSize(delta) {
  state.fontSize = Math.max(70, Math.min(200, state.fontSize + delta));
  localStorage.setItem('kjv_fontSize', state.fontSize);
  applyFontSize();
}

function applyFontSize() {
  DOM.fontSizeVal.innerText = `${state.fontSize}%`;
  DOM.bibleVersDisplay.style.fontSize = `${state.fontSize / 100}rem`;
}

// --- View Mode ---
function toggleViewMode() {
  state.viewMode = (state.viewMode === 'verse') ? 'paragraph' : 'verse';
  localStorage.setItem('kjv_viewMode', state.viewMode);
  applyViewModeIcon();
  renderCurrentChapter();
}

function applyViewModeIcon() {
  if (state.viewMode === 'paragraph') {
    DOM.btnToggleView.innerHTML = '<i class="fas fa-align-justify"></i>';
    DOM.btnToggleView.setAttribute('title', 'Switch to Verse Line Mode');
  } else {
    DOM.btnToggleView.innerHTML = '<i class="fas fa-list-ol"></i>';
    DOM.btnToggleView.setAttribute('title', 'Switch to Paragraph Mode');
  }
}

// --- Event Listeners Registration ---
function registerEventListeners() {
  
  // Left Sidebar Toggle
  DOM.btnToggleSidebar.addEventListener('click', () => {
    DOM.sidebarLeft.classList.toggle('sidebar-collapsed');
    
    // Toggle active state on icon
    const icon = DOM.sidebarToggleIcon || document.querySelector('#sidebar-toggle-icon i');
    if (icon) {
      if (DOM.sidebarLeft.classList.contains('sidebar-collapsed')) {
        icon.className = 'fas fa-bars-staggered';
      } else {
        icon.className = 'fas fa-bars';
      }
    }
  });
  
  // Location header click toggles chapter Selector grid
  DOM.locationDisplay.addEventListener('click', () => {
    toggleChapterSelector();
  });
  
  // Prev/Next Chapter Buttons
  DOM.btnPrevChapter.addEventListener('click', () => {
    if (state.currentChapterIndex > 0) {
      state.currentChapterIndex--;
    } else if (state.currentBookIndex > 0) {
      state.currentBookIndex--;
      state.currentChapterIndex = state.bibleData[state.currentBookIndex].chapters.length - 1;
    }
    renderCurrentChapter();
    saveCurrentLocation();
    renderBookList();
  });
  
  DOM.btnNextChapter.addEventListener('click', () => {
    const book = state.bibleData[state.currentBookIndex];
    if (state.currentChapterIndex < book.chapters.length - 1) {
      state.currentChapterIndex++;
    } else if (state.currentBookIndex < state.bibleData.length - 1) {
      state.currentBookIndex++;
      state.currentChapterIndex = 0;
    }
    renderCurrentChapter();
    saveCurrentLocation();
    renderBookList();
  });
  
  // Right Sidebar Toggle
  DOM.btnToggleStudy.addEventListener('click', () => {
    DOM.sidebarRight.classList.toggle('study-drawer-collapsed');
  });
  
  DOM.btnCloseStudy.addEventListener('click', () => {
    DOM.sidebarRight.classList.add('study-drawer-collapsed');
  });
  
  // Study Panel Tabs Toggling
  DOM.studyTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      DOM.studyTabBtns.forEach(b => b.classList.remove('active'));
      DOM.studyTabPanes.forEach(p => p.style.display = 'none');
      
      btn.classList.add('active');
      const tabId = btn.getAttribute('data-tab');
      document.getElementById(`pane-${tabId}`).style.display = 'block';
      
      // If switching to cross-refs and no verse is selected, load the first verse of the current chapter
      if (tabId === 'cross-refs') {
        if (!state.activeCrossRefVerse) {
          loadCrossReferencesForVerse(state.currentBookIndex, state.currentChapterIndex, 0);
        } else {
          renderCrossRefsList();
        }
      } else if (tabId === 'visuals') {
        updateVisualsTab();
      } else if (tabId === 'maps') {
        updateMapsTab();
      } else if (tabId === 'notes') {
        renderNotesList();
      }
    });
  });
  
  // New Devotional Trigger
  DOM.btnNewDevotional.addEventListener('click', () => {
    renderRandomDevotional();
  });
  renderRandomDevotional(); // initial call
  
  // Search Overlay Triggers
  DOM.btnOpenSearch.addEventListener('click', () => {
    DOM.searchModalContainer.classList.add('active');
    DOM.searchInput.focus();
  });
  
  DOM.btnCloseSearch.addEventListener('click', () => {
    DOM.searchModalContainer.classList.remove('active');
  });
  
  // Close Search with Escape Key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      DOM.searchModalContainer.classList.remove('active');
      DOM.gospelModal.classList.remove('active');
      DOM.timelineModal.classList.remove('active');
      DOM.messageGodModal.classList.remove('active');
      hideVerseMenu();
      if (DOM.imageViewerModal) {
        DOM.imageViewerModal.style.display = 'none';
      }
    }
    
    // Ctrl+F or Cmd+F opens custom search
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
      e.preventDefault();
      DOM.searchModalContainer.classList.add('active');
      DOM.searchInput.focus();
    }
  });
  
  // Search Input triggers search on keyup
  DOM.searchInput.addEventListener('input', () => {
    runSearch();
  });
  
  // Search filters trigger search on change
  DOM.searchFilterTestament.addEventListener('change', () => runSearch());
  DOM.searchFilterBook.addEventListener('change', () => runSearch());
  DOM.searchExactPhrase.addEventListener('change', () => runSearch());
  DOM.searchCaseSensitive.addEventListener('change', () => runSearch());
  
  // Gospel/Salvation Modals
  DOM.btnGospelTrigger.addEventListener('click', () => {
    DOM.gospelModal.classList.add('active');
  });
  DOM.btnCloseGospel.addEventListener('click', () => {
    DOM.gospelModal.classList.remove('active');
  });

  // Timeline Modals
  DOM.btnTimelineTrigger.addEventListener('click', () => {
    DOM.timelineModal.classList.add('active');
  });
  DOM.btnCloseTimeline.addEventListener('click', () => {
    DOM.timelineModal.classList.remove('active');
  });
  
  // Scripture Links inside Salvation modal
  document.querySelectorAll('.salvation-step-verse').forEach(el => {
    el.addEventListener('click', () => {
      const ref = el.getAttribute('data-ref');
      // Format ref is e.g. "rm 3:23"
      const parts = ref.split(' ');
      const bookId = parts[0];
      const numbers = parts[1].split(':');
      const chap = parseInt(numbers[0]) - 1;
      const vers = parseInt(numbers[1]) - 1;
      
      const bookIdx = state.bibleData.findIndex(b => b.id === bookId);
      if (bookIdx !== -1) {
        DOM.gospelModal.classList.remove('active');
        navigateToScripture(bookIdx, chap, vers);
      }
    });
  });
  
  // View mode toggle
  DOM.btnToggleView.addEventListener('click', () => {
    toggleViewMode();
  });
  
  // Font Size Adjusters
  DOM.fontDec.addEventListener('click', () => adjustFontSize(-10));
  DOM.fontInc.addEventListener('click', () => adjustFontSize(10));
  
  // Theme selectors
  DOM.themeDots.forEach(dot => {
    dot.addEventListener('click', () => {
      DOM.themeDots.forEach(d => d.classList.remove('active'));
      dot.classList.add('active');
      
      const t = dot.getAttribute('data-theme');
      state.theme = t;
      document.body.setAttribute('data-theme', t);
      localStorage.setItem('kjv_theme', t);
    });
  });
  
  // Verse context menu action items
  DOM.menuBookmark.addEventListener('click', () => {
    toggleBookmarkCurrentVerse();
  });
  
  DOM.menuCopy.addEventListener('click', () => {
    copyCurrentVerse();
  });
  
  DOM.menuShare.addEventListener('click', () => {
    shareCurrentVerse();
  });
  
  DOM.menuCrossrefs.addEventListener('click', () => {
    if (state.selectedVerseIndex !== null) {
      // Open study drawer if closed
      DOM.sidebarRight.classList.remove('study-drawer-collapsed');
      
      // Activate the Cross-Refs tab
      const crossRefsTabBtn = document.querySelector('.study-tab-btn[data-tab="cross-refs"]');
      if (crossRefsTabBtn) {
        crossRefsTabBtn.click();
      }
      
      // Load references
      loadCrossReferencesForVerse(state.currentBookIndex, state.currentChapterIndex, state.selectedVerseIndex);
      
      hideVerseMenu();
    }
  });
  
  DOM.menuCard.addEventListener('click', () => {
    createCardForSelectedVerse();
  });
  
  DOM.colorDots.forEach(dot => {
    dot.addEventListener('click', (e) => {
      e.stopPropagation();
      const col = dot.getAttribute('data-color');
      highlightCurrentVerse(col);
    });
  });

  DOM.menuNote.addEventListener('click', () => {
    if (state.selectedVerseIndex !== null) {
      // Open study drawer if closed
      DOM.sidebarRight.classList.remove('study-drawer-collapsed');
      
      // Activate the Notes tab
      const notesTabBtn = document.querySelector('.study-tab-btn[data-tab="notes"]');
      if (notesTabBtn) {
        notesTabBtn.click();
      }
      
      // Open note editor
      openNoteEditor(state.currentBookIndex, state.currentChapterIndex, state.selectedVerseIndex);
      
      hideVerseMenu();
    }
  });

  // Notes Search Event Listener
  if (DOM.notesSearch) {
    DOM.notesSearch.addEventListener('input', () => {
      renderNotesList();
    });
  }

  // Notes Editor Close control
  if (DOM.btnCloseNoteEditor) {
    DOM.btnCloseNoteEditor.addEventListener('click', () => {
      closeNoteEditor();
    });
  }

  if (DOM.btnCancelNote) {
    DOM.btnCancelNote.addEventListener('click', () => {
      closeNoteEditor();
    });
  }

  // Notes Editor Save control
  if (DOM.btnSaveNote) {
    DOM.btnSaveNote.addEventListener('click', () => {
      saveNote();
    });
  }

  // Backup & Restore Trigger controls
  if (DOM.btnBackupRestoreTrigger) {
    DOM.btnBackupRestoreTrigger.addEventListener('click', () => {
      openBackupModal();
    });
  }

  if (DOM.btnCloseBackup) {
    DOM.btnCloseBackup.addEventListener('click', () => {
      closeBackupModal();
    });
  }

  if (DOM.backupModal) {
    DOM.backupModal.addEventListener('click', (e) => {
      if (e.target === DOM.backupModal) {
        closeBackupModal();
      }
    });
  }

  // Backup button listeners
  if (DOM.btnExportData) {
    DOM.btnExportData.addEventListener('click', () => {
      exportStudyData();
    });
  }

  if (DOM.btnSelectImportFile) {
    DOM.btnSelectImportFile.addEventListener('click', () => {
      DOM.importFileInput.click();
    });
  }

  if (DOM.importFileInput) {
    DOM.importFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        DOM.importFilename.innerText = file.name;
        importStudyData(file);
      }
    });
  }

  if (DOM.btnClearAllData) {
    DOM.btnClearAllData.addEventListener('click', () => {
      clearAllStudyData();
    });
  }
  
  // Click anywhere to hide context menu
  document.addEventListener('click', () => {
    hideVerseMenu();
  });

  // Handle text selection for Hebrew name tooltip
  document.addEventListener('mouseup', (e) => {
    setTimeout(() => handleTextSelection(e), 10);
  });
  
  document.addEventListener('touchend', (e) => {
    setTimeout(() => handleTextSelection(e), 10);
  });
  
  // Dismiss tooltip on scroll
  if (DOM.readerScrollContainer) {
    DOM.readerScrollContainer.addEventListener('scroll', () => {
      hideNameTooltip();
    });
  }
  
  // Wire name tooltip search button
  if (DOM.btnSearchNameOccurrences) {
    DOM.btnSearchNameOccurrences.addEventListener('click', (e) => {
      e.stopPropagation();
      const nameToSearch = DOM.nameTooltipTitle.textContent;
      if (!nameToSearch) return;
      
      DOM.searchFilterTestament.value = 'all';
      DOM.searchFilterBook.value = 'all';
      DOM.searchExactPhrase.checked = true;
      
      DOM.searchInput.value = nameToSearch;
      runSearch();
      
      DOM.searchModalContainer.classList.add('active');
      DOM.searchInput.focus();
      
      hideNameTooltip();
    });
  }

  // Chapter Summary Widget Toggle
  if (DOM.btnToggleSummaryCollapse && DOM.chapterSummaryPanel) {
    DOM.btnToggleSummaryCollapse.addEventListener('click', () => {
      const isCollapsed = DOM.chapterSummaryPanel.classList.toggle('collapsed');
      localStorage.setItem('kjv_summary_collapsed', isCollapsed ? 'true' : 'false');
    });
  }

  // Fullscreen Image Viewer Modal close controls
  if (DOM.btnCloseImageViewer) {
    DOM.btnCloseImageViewer.addEventListener('click', () => {
      DOM.imageViewerModal.style.display = 'none';
    });
  }

  if (DOM.imageViewerModal) {
    DOM.imageViewerModal.addEventListener('click', (e) => {
      if (e.target === DOM.imageViewerModal) {
        DOM.imageViewerModal.style.display = 'none';
      }
    });
  }

  // Message from God Modal Event Listeners
  if (DOM.btnMessageGod) {
    DOM.btnMessageGod.addEventListener('click', () => {
      showMessageGodModal();
    });
  }

  if (DOM.btnCloseMessageGod) {
    DOM.btnCloseMessageGod.addEventListener('click', () => {
      DOM.messageGodModal.classList.remove('active');
    });
  }

  if (DOM.messageGodModal) {
    DOM.messageGodModal.addEventListener('click', (e) => {
      if (e.target === DOM.messageGodModal) {
        DOM.messageGodModal.classList.remove('active');
      }
    });
  }

  const saveAndReceiveMsg = () => {
    const name = DOM.msgUserName.value.trim();
    if (name) {
      localStorage.setItem('kjv_user_name', name);
      showMessageGodModal();
    }
  };

  if (DOM.btnSubmitMsgName) {
    DOM.btnSubmitMsgName.addEventListener('click', saveAndReceiveMsg);
  }

  if (DOM.msgUserName) {
    DOM.msgUserName.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        saveAndReceiveMsg();
      }
    });
  }

  if (DOM.btnMsgResetName) {
    DOM.btnMsgResetName.addEventListener('click', () => {
      localStorage.removeItem('kjv_user_name');
      showMessageGodModal();
    });
  }

  const jumpToDailyVerse = () => {
    if (activeDailyMessageRef) {
      const bookIdx = state.bibleData.findIndex(b => b.id === activeDailyMessageRef.bookId);
      if (bookIdx !== -1) {
        DOM.messageGodModal.classList.remove('active');
        navigateToScripture(bookIdx, activeDailyMessageRef.chapter - 1, activeDailyMessageRef.verse - 1);
        if (window.innerWidth <= 1024) {
          DOM.sidebarRight.classList.add('study-drawer-collapsed');
        }
      }
    }
  };

  if (DOM.btnMsgGoToVerse) {
    DOM.btnMsgGoToVerse.addEventListener('click', jumpToDailyVerse);
  }

  if (DOM.btnMsgSaveNote) {
    DOM.btnMsgSaveNote.addEventListener('click', () => {
      saveDailyMessageAsNote();
    });
  }

  if (DOM.msgVerseRef) {
    DOM.msgVerseRef.addEventListener('click', jumpToDailyVerse);
  }

  if (DOM.btnMsgCreateCard) {
    DOM.btnMsgCreateCard.addEventListener('click', () => {
      if (activeDailyMessageRef) {
        const dbText = getVerseFromDb(activeDailyMessageRef.bookId, activeDailyMessageRef.chapter, activeDailyMessageRef.verse);
        const cleanText = dbText ? getSearchableText(dbText) : getSearchableText(activeDailyMessageRef.text);
        DOM.messageGodModal.classList.remove('active');
        openCardCreator(cleanText, activeDailyMessageRef.ref);
      }
    });
  }
}

// --- Hebrew Name Meaning Tooltip Helpers ---
function getCleanName(text) {
  if (!text) return '';
  let clean = text.toLowerCase().trim();
  
  // Strip possessive endings 's or '
  clean = clean.replace(/'s$/, '');
  clean = clean.replace(/'$/, '');
  
  // Strip surrounding punctuation/quotes/brackets
  clean = clean.replace(/^[^a-z0-9]+/, '');
  clean = clean.replace(/[^a-z0-9]+$/, '');
  
  return clean;
}

function handleTextSelection(e) {
  if (!state.namesDictionary) return;
  
  // If the user clicked/touched inside the tooltip container itself, ignore
  if (DOM.nameTooltip && e && e.target && DOM.nameTooltip.contains(e.target)) {
    return;
  }
  
  const selection = window.getSelection();
  const selectionText = selection.toString().trim();
  
  if (!selectionText) {
    hideNameTooltip();
    return;
  }
  
  const cleanName = getCleanName(selectionText);
  const nameData = state.namesDictionary[cleanName];
  
  if (nameData) {
    showNameTooltip(selection, nameData);
  } else {
    hideNameTooltip();
  }
}

function showNameTooltip(selection, nameData) {
  if (!DOM.nameTooltip || selection.rangeCount === 0) return;
  
  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  
  // Populate the tooltip content
  DOM.nameTooltipTitle.textContent = nameData.name;
  DOM.nameTooltipMeaning.textContent = nameData.meaning;
  
  // Show first to measure dimensions
  DOM.nameTooltip.style.display = 'block';
  const tooltipWidth = DOM.nameTooltip.offsetWidth;
  const tooltipHeight = DOM.nameTooltip.offsetHeight;
  
  // Calculate center of selection
  const selectionCenter = rect.left + rect.width / 2;
  
  // Absolute positioning relative to document body
  const scrollX = window.scrollX || window.pageXOffset;
  const scrollY = window.scrollY || window.pageYOffset;
  
  let left = selectionCenter - tooltipWidth / 2 + scrollX;
  let top = rect.top - tooltipHeight - 12 + scrollY; // 12px gap above selection
  
  // Fallback: position below the selection if it overflows the top viewport edge
  if (rect.top - tooltipHeight - 12 < 0) {
    top = rect.bottom + 12 + scrollY;
  }
  
  // Prevent horizontal overflow
  const margin = 10;
  if (left < margin) {
    left = margin;
  } else if (left + tooltipWidth > window.innerWidth - margin) {
    left = window.innerWidth - tooltipWidth - margin;
  }
  
  DOM.nameTooltip.style.left = `${left}px`;
  DOM.nameTooltip.style.top = `${top}px`;
  
  // Activate animation transitions
  requestAnimationFrame(() => {
    DOM.nameTooltip.classList.add('active');
  });
}

function hideNameTooltip() {
  if (!DOM.nameTooltip) return;
  
  if (DOM.nameTooltip.classList.contains('active')) {
    DOM.nameTooltip.classList.remove('active');
    setTimeout(() => {
      if (!DOM.nameTooltip.classList.contains('active')) {
        DOM.nameTooltip.style.display = 'none';
      }
    }, 200);
  }
}

// --- Resizable Layout Panels ---
function initResizablePanels() {
  const dividerLeft = document.getElementById('resize-divider-left');
  const dividerRight = document.getElementById('resize-divider-right');
  const sidebarLeft = DOM.sidebarLeft;
  const sidebarRight = DOM.sidebarRight;

  if (!dividerLeft || !dividerRight || !sidebarLeft || !sidebarRight) return;

  // Restore saved widths on startup
  const savedLeftWidth = localStorage.getItem('kjv_sidebar_left_width');
  if (savedLeftWidth) {
    sidebarLeft.style.width = savedLeftWidth;
  }
  const savedRightWidth = localStorage.getItem('kjv_sidebar_right_width');
  if (savedRightWidth) {
    sidebarRight.style.width = savedRightWidth;
  }

  // Set divider initial visibility
  dividerLeft.style.display = sidebarLeft.classList.contains('sidebar-collapsed') ? 'none' : 'block';
  dividerRight.style.display = sidebarRight.classList.contains('study-drawer-collapsed') ? 'none' : 'block';

  let dragSide = null; // 'left' or 'right'
  let startX = 0;
  let startWidth = 0;
  let activePointerId = null;

  function onDragStart(e, side) {
    // Only drag on left click for mouse
    if (e.pointerType === 'mouse' && e.button !== 0) return;

    e.preventDefault();
    dragSide = side;
    startX = e.clientX;
    activePointerId = e.pointerId;

    const targetDivider = e.currentTarget;
    try {
      targetDivider.setPointerCapture(e.pointerId);
    } catch (err) {
      console.warn("Could not set pointer capture:", err);
    }

    if (side === 'left') {
      startWidth = sidebarLeft.offsetWidth;
      sidebarLeft.style.transition = 'none';
      dividerLeft.classList.add('dragging');
    } else {
      startWidth = sidebarRight.offsetWidth;
      sidebarRight.style.transition = 'none';
      dividerRight.classList.add('dragging');
    }

    document.body.classList.add('dragging-active');

    // Register global event listeners on window to capture drag movement anywhere on the viewport
    window.addEventListener('pointermove', onDragMove);
    window.addEventListener('pointerup', onDragEnd);
    window.addEventListener('pointercancel', onDragEnd);
  }

  function onDragMove(e) {
    if (!dragSide) return;

    const currentX = e.clientX;
    const deltaX = currentX - startX;

    if (dragSide === 'left') {
      let newWidth = startWidth + deltaX;
      // Constraints: 200px - 500px
      if (newWidth < 200) newWidth = 200;
      if (newWidth > 500) newWidth = 500;
      sidebarLeft.style.width = `${newWidth}px`;
    } else {
      // Right panel: dragging left (negative deltaX) increases width
      let newWidth = startWidth - deltaX;
      // Constraints: 280px - 600px
      if (newWidth < 280) newWidth = 280;
      if (newWidth > 600) newWidth = 600;
      sidebarRight.style.width = `${newWidth}px`;
    }
  }

  function onDragEnd(e) {
    if (!dragSide) return;

    if (activePointerId !== null) {
      const divider = dragSide === 'left' ? dividerLeft : dividerRight;
      try {
        divider.releasePointerCapture(activePointerId);
      } catch (err) {
        // Ignored
      }
      activePointerId = null;
    }

    if (dragSide === 'left') {
      sidebarLeft.style.transition = '';
      dividerLeft.classList.remove('dragging');
      localStorage.setItem('kjv_sidebar_left_width', sidebarLeft.style.width);
    } else {
      sidebarRight.style.transition = '';
      dividerRight.classList.remove('dragging');
      localStorage.setItem('kjv_sidebar_right_width', sidebarRight.style.width);
    }

    document.body.classList.remove('dragging-active');
    dragSide = null;

    // Clean up global event listeners on window
    window.removeEventListener('pointermove', onDragMove);
    window.removeEventListener('pointerup', onDragEnd);
    window.removeEventListener('pointercancel', onDragEnd);
  }

  // Pointer Event Listeners - only listen for initial pointerdown on the divider handles
  dividerLeft.addEventListener('pointerdown', (e) => onDragStart(e, 'left'));
  dividerRight.addEventListener('pointerdown', (e) => onDragStart(e, 'right'));

  // Double-Click to Reset to Defaults
  dividerLeft.addEventListener('dblclick', () => {
    sidebarLeft.style.transition = 'none';
    sidebarLeft.style.width = '320px';
    localStorage.setItem('kjv_sidebar_left_width', '320px');
    sidebarLeft.offsetHeight; // Force reflow
    sidebarLeft.style.transition = '';
  });
  dividerRight.addEventListener('dblclick', () => {
    sidebarRight.style.transition = 'none';
    sidebarRight.style.width = '360px';
    localStorage.setItem('kjv_sidebar_right_width', '360px');
    sidebarRight.offsetHeight; // Force reflow
    sidebarRight.style.transition = '';
  });

  // Button-Triggered Panel Width Resizing
  function adjustLeftWidth(delta) {
    sidebarLeft.style.transition = 'none';
    const currentWidth = sidebarLeft.offsetWidth;
    let newWidth = currentWidth + delta;
    if (newWidth < 200) newWidth = 200;
    if (newWidth > 500) newWidth = 500;
    sidebarLeft.style.width = `${newWidth}px`;
    localStorage.setItem('kjv_sidebar_left_width', `${newWidth}px`);
    sidebarLeft.offsetHeight; // Force reflow
    sidebarLeft.style.transition = '';
  }

  function adjustRightWidth(delta) {
    sidebarRight.style.transition = 'none';
    const currentWidth = sidebarRight.offsetWidth;
    let newWidth = currentWidth + delta;
    if (newWidth < 280) newWidth = 280;
    if (newWidth > 600) newWidth = 600;
    sidebarRight.style.width = `${newWidth}px`;
    localStorage.setItem('kjv_sidebar_right_width', `${newWidth}px`);
    sidebarRight.offsetHeight; // Force reflow
    sidebarRight.style.transition = '';
  }

  const btnLeftDec = document.getElementById('btn-left-width-dec');
  const btnLeftInc = document.getElementById('btn-left-width-inc');
  const btnRightDec = document.getElementById('btn-right-width-dec');
  const btnRightInc = document.getElementById('btn-right-width-inc');

  if (btnLeftDec) btnLeftDec.addEventListener('click', () => adjustLeftWidth(-20));
  if (btnLeftInc) btnLeftInc.addEventListener('click', () => adjustLeftWidth(20));
  if (btnRightDec) btnRightDec.addEventListener('click', () => adjustRightWidth(-20));
  if (btnRightInc) btnRightInc.addEventListener('click', () => adjustRightWidth(20));

  // MutationObserver to toggle divider visibility when panels are toggled (collapsed / expanded)
  const classObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'class') {
        const target = mutation.target;
        if (target === sidebarLeft) {
          const isCollapsed = sidebarLeft.classList.contains('sidebar-collapsed');
          dividerLeft.style.display = isCollapsed ? 'none' : 'block';
        } else if (target === sidebarRight) {
          const isCollapsed = sidebarRight.classList.contains('study-drawer-collapsed');
          dividerRight.style.display = isCollapsed ? 'none' : 'block';
        }
      }
    });
  });

  classObserver.observe(sidebarLeft, { attributes: true, attributeFilter: ['class'] });
  classObserver.observe(sidebarRight, { attributes: true, attributeFilter: ['class'] });
}

// ==========================================
// --- Scripture Card Generator (Card Creator) ---
// ==========================================

// --- Card Creator State ---
const cardState = {
  text: '',
  reference: '',
  aspectRatio: '1-1',
  activePresetIndex: 0,
  fontSize: 36,
  fontFamily: 'Lora',
  alignment: 'center',
  showQuotes: true,
  showBorder: true,
  showWatermark: true
};

// --- Beautiful Card Design Background Presets ---
const cardPresets = [
  {
    name: 'Dawn Grace',
    style: {
      bg: { type: 'gradient', colors: ['#fbc2eb', '#a6c1ee'] },
      text: '#2b2335',
      accent: '#6c5ce7',
      isDark: false
    }
  },
  {
    name: 'Heavenly Blue',
    style: {
      bg: { type: 'gradient', colors: ['#2193b0', '#6dd5ed'] },
      text: '#ffffff',
      accent: '#ffeaa7',
      isDark: true
    }
  },
  {
    name: 'Sacred Crimson',
    style: {
      bg: { type: 'gradient', colors: ['#8a0f14', '#3a0007'] },
      text: '#ffffff',
      accent: '#d4af37',
      isDark: true
    }
  },
  {
    name: 'Divine Light',
    style: {
      bg: { type: 'gradient', colors: ['#f3e7e9', '#e3eeff'] },
      text: '#2b2335',
      accent: '#b01a20',
      isDark: false
    }
  },
  {
    name: 'Parchment Scroll',
    style: {
      bg: { type: 'solid', color: '#faf5e6' },
      text: '#51361c',
      accent: '#b01a20',
      isDark: false
    }
  },
  {
    name: 'Midnight Glory',
    style: {
      bg: { type: 'gradient', colors: ['#0f0c20', '#1a103c'] },
      text: '#ffffff',
      accent: '#f1c232',
      isDark: true
    }
  },
  {
    name: 'Royal Gold',
    style: {
      bg: { type: 'gradient', colors: ['#2d0b3d', '#13021f'] },
      text: '#ffffff',
      accent: '#d4af37',
      isDark: true
    }
  },
  {
    name: 'Eden Garden',
    style: {
      bg: { type: 'gradient', colors: ['#11998e', '#38ef7d'] },
      text: '#ffffff',
      accent: '#ffeaa7',
      isDark: true
    }
  }
];

function initCardCreator() {
  if (!DOM.cardModal) return;

  // Initialize preset swatches in the settings panel
  initCardPresets();

  // Aspect Ratio selection buttons
  document.querySelectorAll('.aspect-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.aspect-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      cardState.aspectRatio = btn.getAttribute('data-ratio');
      renderScriptureCard();
    });
  });

  // Alignment buttons
  document.querySelectorAll('.align-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.align-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      cardState.alignment = btn.getAttribute('data-align');
      renderScriptureCard();
    });
  });

  // Font Size slider
  DOM.cardFontSize.addEventListener('input', () => {
    cardState.fontSize = parseInt(DOM.cardFontSize.value, 10);
    DOM.cardFontSizeVal.innerText = `${cardState.fontSize}px`;
    renderScriptureCard();
  });

  // Font Family dropdown select
  DOM.cardFontFamily.addEventListener('change', () => {
    cardState.fontFamily = DOM.cardFontFamily.value;
    renderScriptureCard();
  });

  // Toggles checks
  DOM.cardToggleQuotes.addEventListener('change', () => {
    cardState.showQuotes = DOM.cardToggleQuotes.checked;
    renderScriptureCard();
  });

  DOM.cardToggleBorder.addEventListener('change', () => {
    cardState.showBorder = DOM.cardToggleBorder.checked;
    renderScriptureCard();
  });

  DOM.cardToggleWatermark.addEventListener('change', () => {
    cardState.showWatermark = DOM.cardToggleWatermark.checked;
    renderScriptureCard();
  });

  // Textarea input
  DOM.cardTextEdit.addEventListener('input', () => {
    cardState.text = DOM.cardTextEdit.value;
    renderScriptureCard();
  });

  // Modal Cancel and Close handlers
  const closeCreator = () => {
    DOM.cardModal.classList.remove('active');
  };
  DOM.btnCloseCard.addEventListener('click', closeCreator);
  DOM.btnCancelCard.addEventListener('click', closeCreator);

  // Modal download handler
  DOM.btnDownloadCard.addEventListener('click', () => {
    const filename = `${cardState.reference.replace(/[\s:]/g, '_')}_scripture_card.png`;
    const dataUrl = DOM.cardCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
}

// Generate the visual clickable preset background swatches list
function initCardPresets() {
  DOM.bgSwatchesList.innerHTML = '';
  cardPresets.forEach((preset, idx) => {
    const swatch = document.createElement('div');
    swatch.className = `preset-swatch ${idx === cardState.activePresetIndex ? 'active' : ''}`;
    swatch.title = preset.name;

    if (preset.style.bg.type === 'gradient') {
      swatch.style.background = `linear-gradient(135deg, ${preset.style.bg.colors.join(', ')})`;
    } else {
      swatch.style.background = preset.style.bg.color;
    }

    swatch.addEventListener('click', () => {
      document.querySelectorAll('.preset-swatch').forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');
      cardState.activePresetIndex = idx;
      renderScriptureCard();
    });

    DOM.bgSwatchesList.appendChild(swatch);
  });
}

function createCardForSelectedVerse() {
  if (state.selectedVerseIndex !== null) {
    const book = state.bibleData[state.currentBookIndex];
    const chapterNum = state.currentChapterIndex + 1;
    const verseNum = state.selectedVerseIndex + 1;
    const rawText = book.chapters[state.currentChapterIndex][state.selectedVerseIndex];

    const cleanText = getSearchableText(rawText);
    const referenceStr = `${book.name} ${chapterNum}:${verseNum}`;

    openCardCreator(cleanText, referenceStr);
  }
}

function openCardCreator(text, reference) {
  cardState.text = text;
  cardState.reference = reference;

  // Sync inputs
  DOM.cardTextEdit.value = text;
  DOM.cardFontSize.value = cardState.fontSize;
  DOM.cardFontSizeVal.innerText = `${cardState.fontSize}px`;
  DOM.cardFontFamily.value = cardState.fontFamily;
  DOM.cardToggleQuotes.checked = cardState.showQuotes;
  DOM.cardToggleBorder.checked = cardState.showBorder;
  DOM.cardToggleWatermark.checked = cardState.showWatermark;

  // Sync aspect buttons
  document.querySelectorAll('.aspect-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-ratio') === cardState.aspectRatio);
  });

  // Sync align buttons
  document.querySelectorAll('.align-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-align') === cardState.alignment);
  });

  // Sync swatches
  document.querySelectorAll('.preset-swatch').forEach((swatch, idx) => {
    swatch.classList.toggle('active', idx === cardState.activePresetIndex);
  });

  // Show Modal
  DOM.cardModal.classList.add('active');

  // Draw initial preview (wait for fonts to load for exact spacing)
  if (document.fonts) {
    document.fonts.ready.then(() => {
      renderScriptureCard();
    });
  } else {
    renderScriptureCard();
  }
}

// Canvas Scripture Card compilation engine
function renderScriptureCard() {
  const canvas = DOM.cardCanvas;
  const ctx = canvas.getContext('2d');

  // Enforce high resolution dimensions based on aspect ratio
  let width, height;
  switch (cardState.aspectRatio) {
    case '9-16':
      width = 1215;
      height = 2160;
      break;
    case '16-9':
      width = 2160;
      height = 1215;
      break;
    case '1-1':
    default:
      width = 2160;
      height = 2160;
      break;
  }

  canvas.width = width;
  canvas.height = height;

  const preset = cardPresets[cardState.activePresetIndex];
  const isDark = preset.style.isDark;

  // Draw background preset
  if (preset.style.bg.type === 'gradient') {
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    preset.style.bg.colors.forEach((color, idx) => {
      grad.addColorStop(idx / (preset.style.bg.colors.length - 1), color);
    });
    ctx.fillStyle = grad;
  } else {
    ctx.fillStyle = preset.style.bg.color;
  }
  ctx.fillRect(0, 0, width, height);

  // Responsive padding calculation (12% of smallest dimension)
  const padding = Math.min(width, height) * 0.12;
  const contentWidth = width - 2 * padding;

  // Large background double quotes
  if (cardState.showQuotes) {
    ctx.save();
    const quoteSize = Math.min(width, height) * 0.22;
    ctx.font = `italic 700 ${quoteSize}px Lora, Georgia, serif`;
    ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.035)';
    ctx.textBaseline = 'middle';

    ctx.textAlign = 'left';
    ctx.fillText('“', padding * 0.6, padding * 1.4);

    ctx.textAlign = 'right';
    ctx.fillText('”', width - padding * 0.6, height - padding * 1.2);
    ctx.restore();
  }

  // Elegant double gold border
  if (cardState.showBorder) {
    ctx.save();
    const borderCol = preset.style.accent || '#d4af37';
    ctx.strokeStyle = borderCol;

    const outerInset = Math.min(width, height) * 0.035;
    ctx.lineWidth = Math.min(width, height) * 0.003;
    ctx.strokeRect(outerInset, outerInset, width - 2 * outerInset, height - 2 * outerInset);

    const innerInset = outerInset + Math.min(width, height) * 0.012;
    ctx.lineWidth = Math.min(width, height) * 0.0015;
    ctx.strokeRect(innerInset, innerInset, width - 2 * innerInset, height - 2 * innerInset);

    // L-brackets in corners of inner border
    const bracketLen = Math.min(width, height) * 0.04;
    ctx.lineWidth = Math.min(width, height) * 0.004;

    ctx.beginPath();
    ctx.moveTo(innerInset + bracketLen, innerInset);
    ctx.lineTo(innerInset, innerInset);
    ctx.lineTo(innerInset, innerInset + bracketLen);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(width - innerInset - bracketLen, innerInset);
    ctx.lineTo(width - innerInset, innerInset);
    ctx.lineTo(width - innerInset, innerInset + bracketLen);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(innerInset + bracketLen, height - innerInset);
    ctx.lineTo(innerInset, height - innerInset);
    ctx.lineTo(innerInset, height - innerInset + bracketLen);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(width - innerInset - bracketLen, height - innerInset);
    ctx.lineTo(width - innerInset, height - innerInset);
    ctx.lineTo(width - innerInset, height - innerInset + bracketLen);
    ctx.stroke();

    ctx.restore();
  }

  // Draw scripture text
  ctx.save();
  const scale = width / 600;
  const baseFontSize = cardState.fontSize * scale;

  let fontString = '';
  if (cardState.fontFamily === 'Cinzel') {
    fontString = `400 ${baseFontSize}px Cinzel, serif`;
  } else if (cardState.fontFamily === 'Inter') {
    fontString = `400 ${baseFontSize}px Inter, sans-serif`;
  } else {
    fontString = `italic 500 ${baseFontSize}px Lora, Georgia, serif`;
  }
  ctx.font = fontString;
  ctx.fillStyle = preset.style.text;
  ctx.textBaseline = 'top';
  ctx.textAlign = cardState.alignment;

  const lines = wrapText(ctx, cardState.text, contentWidth);
  const lineHeight = baseFontSize * 1.45;
  const textBlockHeight = lines.length * lineHeight;

  const refFontSize = Math.max(16 * scale, baseFontSize * 0.55);
  let refFontString = `700 ${refFontSize}px Cinzel, serif`;
  if (cardState.fontFamily === 'Inter') {
    refFontString = `700 ${refFontSize}px Inter, sans-serif`;
  }

  const refSpacing = baseFontSize * 1.1;
  const refHeight = refFontSize * 1.2;
  const totalContentHeight = textBlockHeight + refSpacing + refHeight;

  let yStart = (height - totalContentHeight) / 2;
  if (yStart < padding) {
    yStart = padding;
  }

  lines.forEach((line, index) => {
    let x = padding;
    if (cardState.alignment === 'center') {
      x = width / 2;
    } else if (cardState.alignment === 'right') {
      x = width - padding;
    }
    ctx.fillText(line, x, yStart + index * lineHeight);
  });

  // Draw reference
  ctx.font = refFontString;
  ctx.fillStyle = preset.style.accent || preset.style.text;

  let refX = padding;
  if (cardState.alignment === 'center') {
    refX = width / 2;
  } else if (cardState.alignment === 'right') {
    refX = width - padding;
  }
  ctx.fillText(cardState.reference, refX, yStart + textBlockHeight + refSpacing);
  ctx.restore();

  // Draw bottom brand watermark
  if (cardState.showWatermark) {
    ctx.save();
    const watermarkSize = 14 * scale;
    ctx.font = `600 ${watermarkSize}px Inter, sans-serif`;
    ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.22)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText('THE HOLY BIBLE • KJV Reader', width / 2, height - padding * 0.45);
    ctx.restore();
  }
}

// Canvas text wrapping helper
function wrapText(ctx, text, maxWidth) {
  const paragraphs = text.split('\n');
  const lines = [];

  for (let p of paragraphs) {
    const words = p.split(' ');
    let currentLine = '';

    for (let word of words) {
      const testLine = currentLine ? currentLine + ' ' + word : word;
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;

      if (testWidth > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }
  }
  return lines;
}

// --- Life of Christ Timeline Logic ---
let activeTimelinePhase = 'all';

function initTimeline() {
  renderTimeline();

  // Register filter event listeners
  const filterBtns = document.querySelectorAll('.timeline-filters .filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      filterBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      activeTimelinePhase = e.target.getAttribute('data-phase');
      renderTimeline();
    });
  });
}

function renderTimeline() {
  DOM.timelineContainer.innerHTML = '';
  
  // Filter events
  const filteredEvents = timelineEvents.filter(event => {
    return activeTimelinePhase === 'all' || event.phase === activeTimelinePhase;
  });

  if (filteredEvents.length === 0) {
    DOM.timelineContainer.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-hourglass-empty empty-state-icon"></i>
        <p>No events found for this phase.</p>
      </div>
    `;
    return;
  }

  // Generate cards
  filteredEvents.forEach((event, index) => {
    // Alternating left/right class on desktop
    const positionClass = index % 2 === 0 ? 'left' : 'right';
    
    const timelineItem = document.createElement('div');
    timelineItem.className = `timeline-item ${positionClass} phase-${event.phase}`;
    // Add dynamic inline delay for entry animation fade-in cascading
    timelineItem.style.animationDelay = `${index * 0.05}s`;

    timelineItem.innerHTML = `
      <div class="timeline-badge" title="${event.phaseTag}">
        <i class="fas ${event.icon}"></i>
      </div>
      <div class="timeline-card">
        <div class="timeline-card-header">
          <span class="timeline-phase-tag">${event.phaseTag}</span>
          <span class="timeline-verse-link" data-book-id="${event.bookId}" data-chapter="${event.chapter}" data-verse="${event.verse}">
            <i class="fas fa-book-open"></i> ${event.ref}
          </span>
        </div>
        <h4 class="timeline-card-title">${event.title}</h4>
        <p class="timeline-card-desc">${event.desc}</p>
      </div>
    `;

    // Add click handler for scripture navigation
    const linkEl = timelineItem.querySelector('.timeline-verse-link');
    linkEl.addEventListener('click', () => {
      const bookIdx = state.bibleData.findIndex(b => b.id === event.bookId);
      if (bookIdx !== -1) {
        // Close timeline modal
        DOM.timelineModal.classList.remove('active');
        // Navigate
        navigateToScripture(bookIdx, event.chapter - 1, event.verse - 1);
      }
    });

    DOM.timelineContainer.appendChild(timelineItem);
  });
}

// --- Interactive Biblical Geography (Map Viewer) ---

function getBiblicalWorldSvg() {
  return `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <!-- Grid lines -->
      <line x1="10" y1="0" x2="10" y2="100" class="map-svg-grid" />
      <line x1="20" y1="0" x2="20" y2="100" class="map-svg-grid" />
      <line x1="30" y1="0" x2="30" y2="100" class="map-svg-grid" />
      <line x1="40" y1="0" x2="40" y2="100" class="map-svg-grid" />
      <line x1="50" y1="0" x2="50" y2="100" class="map-svg-grid" />
      <line x1="60" y1="0" x2="60" y2="100" class="map-svg-grid" />
      <line x1="70" y1="0" x2="70" y2="100" class="map-svg-grid" />
      <line x1="80" y1="0" x2="80" y2="100" class="map-svg-grid" />
      <line x1="90" y1="0" x2="90" y2="100" class="map-svg-grid" />
      <line x1="0" y1="20" x2="100" y2="20" class="map-svg-grid" />
      <line x1="0" y1="40" x2="100" y2="40" class="map-svg-grid" />
      <line x1="0" y1="60" x2="100" y2="60" class="map-svg-grid" />
      <line x1="0" y1="80" x2="100" y2="80" class="map-svg-grid" />

      <!-- Land base -->
      <rect x="0" y="0" width="100" height="100" class="map-svg-land" />

      <!-- Mediterranean Sea -->
      <path class="map-svg-water" d="M 0,25 C 5,23 10,20 12,18 C 10,25 9,30 11,33 C 14,30 15,22 17,15 C 20,15 22,25 21,30 C 23,28 24,20 25,16 C 28,20 28,30 27,35 C 32,33 35,28 39,30 C 42,32 45,34 53,35 C 55,38 56,48 55,56 C 50,56 46,55 42,58 C 38,60 30,55 24,53 C 18,50 10,48 0,48 Z" stroke="var(--border-color)" stroke-width="0.5" />
      
      <!-- Crete -->
      <path class="map-svg-water" d="M 28,42 C 30,42 32,41 33,42 C 32,43 30,43 28,43 Z" stroke="var(--border-color)" stroke-width="0.3" />
      <!-- Cyprus -->
      <path class="map-svg-water" d="M 48,42 C 50,41 51,41 52,42 C 51,43 49,43 48,43 Z" stroke="var(--border-color)" stroke-width="0.3" />

      <!-- Black Sea -->
      <path class="map-svg-water" d="M 38,12 C 42,10 48,8 52,10 C 56,12 58,15 57,18 C 55,20 50,22 46,21 C 42,20 39,16 38,12 Z" stroke="var(--border-color)" stroke-width="0.5" />

      <!-- Caspian Sea -->
      <path class="map-svg-water" d="M 80,10 C 82,10 83,14 84,18 C 85,22 84,26 83,28 C 81,28 80,24 80,20 C 79,16 79,12 80,10 Z" stroke="var(--border-color)" stroke-width="0.5" />

      <!-- Red Sea -->
      <path class="map-svg-water" d="M 47,65 C 47,65 48,68 49,70 C 50,72 52,78 54,84 C 56,90 58,95 60,100 L 56,100 C 54,95 52,90 50,84 C 48,78 46,74 46,70 Z" stroke="var(--border-color)" stroke-width="0.5" />

      <!-- Persian Gulf -->
      <path class="map-svg-water" d="M 83,62 C 85,65 87,68 89,70 C 91,72 95,74 100,76 L 100,82 C 95,80 91,78 87,75 C 84,72 82,68 81,64 Z" stroke="var(--border-color)" stroke-width="0.5" />

      <!-- Nile River -->
      <path class="map-svg-river" d="M 44,100 C 43,95 43,90 44,85 C 44,80 45,75 44,70 C 44,68 45,67 46,65" />
      <path class="map-svg-river-minor" d="M 46,65 L 44,60 M 46,65 L 48,60" />

      <!-- Euphrates River -->
      <path class="map-svg-river" d="M 50,28 C 53,28 58,29 60,32 C 62,35 64,40 68,43 C 72,46 76,49 81,64" />

      <!-- Tigris River -->
      <path class="map-svg-river" d="M 54,23 C 58,25 61,28 64,30 C 67,33 70,38 73,42 C 76,46 79,51 81,64" />

      <!-- Labels -->
      <text x="12" y="21" class="map-svg-label">ITALY</text>
      <text x="26" y="32" class="map-svg-label">GREECE</text>
      <text x="42" y="30" class="map-svg-label">ASIA MINOR</text>
      <text x="32" y="55" class="map-svg-label">MEDITERRANEAN SEA</text>
      <text x="40" y="78" class="map-svg-label">EGYPT</text>
      <text x="52" y="68" class="map-svg-label region">SINAI</text>
      <text x="60" y="47" class="map-svg-label region">CANAAN</text>
      <text x="73" y="35" class="map-svg-label region">MESOPOTAMIA</text>
      <text x="68" y="72" class="map-svg-label region">ARABIA</text>
      <text x="88" y="48" class="map-svg-label">PERSIA</text>
    </svg>
  `;
}

function getHolyLandSvg() {
  return `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <!-- Grid lines -->
      <line x1="10" y1="0" x2="10" y2="100" class="map-svg-grid" />
      <line x1="20" y1="0" x2="20" y2="100" class="map-svg-grid" />
      <line x1="30" y1="0" x2="30" y2="100" class="map-svg-grid" />
      <line x1="40" y1="0" x2="40" y2="100" class="map-svg-grid" />
      <line x1="50" y1="0" x2="50" y2="100" class="map-svg-grid" />
      <line x1="60" y1="0" x2="60" y2="100" class="map-svg-grid" />
      <line x1="70" y1="0" x2="70" y2="100" class="map-svg-grid" />
      <line x1="80" y1="0" x2="80" y2="100" class="map-svg-grid" />
      <line x1="90" y1="0" x2="90" y2="100" class="map-svg-grid" />
      <line x1="0" y1="20" x2="100" y2="20" class="map-svg-grid" />
      <line x1="0" y1="40" x2="100" y2="40" class="map-svg-grid" />
      <line x1="0" y1="60" x2="100" y2="60" class="map-svg-grid" />
      <line x1="0" y1="80" x2="100" y2="80" class="map-svg-grid" />

      <!-- Land base -->
      <rect x="0" y="0" width="100" height="100" class="map-svg-land" />

      <!-- Mediterranean Sea (West Coast) -->
      <path class="map-svg-water" d="M 0,0 L 22,0 C 21,10 18,18 17,25 C 16,32 18,40 18,48 C 17,56 15,64 12,72 C 10,80 5,90 0,100 Z" stroke="var(--border-color)" stroke-width="0.8" />

      <!-- Sea of Galilee -->
      <ellipse cx="59" cy="21" rx="2.5" ry="3.5" class="map-svg-lake" />

      <!-- Dead Sea -->
      <path class="map-svg-lake" d="M 57,64 C 58.5,64 59.5,66 59.5,70 C 59.5,74 58.5,78 57,78 C 55.5,78 55,74 55,70 C 55,66 55.5,64 57,64 Z" />

      <!-- Jordan River -->
      <path class="map-svg-river" d="M 59,24.5 C 58.5,30 58,35 58,40 C 58,45 58.5,50 58,55 C 57.8,59 57.3,62 57,64" />

      <!-- Upper Jordan / Yarmouk / Jabbok (Minor Rivers) -->
      <path class="map-svg-river-minor" d="M 59,17.5 L 59,10" />
      <path class="map-svg-river-minor" d="M 59.5,23 C 62,23 64,24 66,24.5" />
      <path class="map-svg-river-minor" d="M 58.2,46 C 61,47 63,46 66,45" />
      <path class="map-svg-river-minor" d="M 57.5,58 C 60,59 62,58 64,57" />

      <!-- Labels -->
      <text x="10" y="50" class="map-svg-label" transform="rotate(-90 10 50)" style="font-size: 2.4px;">MEDITERRANEAN SEA</text>
      <text x="45" y="15" class="map-svg-label region">GALILEE</text>
      <text x="68" y="21" class="map-svg-label" style="font-size: 1.8px; text-anchor: start;">Sea of Galilee</text>
      <text x="45" y="42" class="map-svg-label region">SAMARIA</text>
      <text x="45" y="62" class="map-svg-label region">JUDEA</text>
      <text x="67" y="70" class="map-svg-label" style="font-size: 1.8px; text-anchor: start;">Dead Sea</text>
      <text x="65" y="40" class="map-svg-label" style="font-size: 1.6px; fill: var(--text-secondary);">Jordan River</text>
      <text x="75" y="50" class="map-svg-label region">PEREA</text>
      <text x="72" y="30" class="map-svg-label region">DECAPOLIS</text>
    </svg>
  `;
}

function initMapsTab() {
  if (!DOM.mapSelectorButtons || DOM.mapSelectorButtons.length === 0) return;

  // Bind Map Selector Buttons
  DOM.mapSelectorButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      DOM.mapSelectorButtons.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      state.activeMapType = e.target.getAttribute('data-map');
      // Reset selected place when switching maps to prevent showing place details of off-map locations
      state.selectedPlaceId = null;
      updateMapsTab();
    });
  });

  // Bind Search Input
  if (DOM.mapPlacesSearch) {
    DOM.mapPlacesSearch.addEventListener('input', () => {
      // Filter the list
      const currentBook = state.bibleData ? state.bibleData[state.currentBookIndex].name : "";
      const currentChapterNum = state.currentChapterIndex + 1;
      const activePlaces = state.biblicalPlaces ? state.biblicalPlaces.filter(place => {
        return place.occurrences && 
               place.occurrences[currentBook] && 
               place.occurrences[currentBook].includes(currentChapterNum);
      }) : [];
      renderPlacesList(activePlaces);
    });
  }
}

function updateMapsTab() {
  if (!state.biblicalPlaces || !DOM.mapSvgContainer) return;

  const currentBook = state.bibleData ? state.bibleData[state.currentBookIndex].name : "";
  const currentChapterNum = state.currentChapterIndex + 1;

  // Render SVG Map background
  if (state.activeMapType === 'world') {
    DOM.mapSvgContainer.innerHTML = getBiblicalWorldSvg();
  } else {
    DOM.mapSvgContainer.innerHTML = getHolyLandSvg();
  }

  // Determine active places for the current chapter
  const activePlaces = state.biblicalPlaces.filter(place => {
    return place.occurrences && 
           place.occurrences[currentBook] && 
           place.occurrences[currentBook].includes(currentChapterNum);
  });

  // Filter places to show on the current map
  const placesToShow = state.biblicalPlaces.filter(place => {
    return place.maps[state.activeMapType] !== null;
  });

  // Draw pins
  placesToShow.forEach(place => {
    const coords = place.maps[state.activeMapType];
    if (!coords) return;

    const pin = document.createElement('div');
    pin.className = 'map-pin';
    
    // Check if active or selected
    const isActive = activePlaces.some(ap => ap.id === place.id);
    const isSelected = state.selectedPlaceId === place.id;
    
    if (isActive) pin.classList.add('active');
    if (isSelected) pin.classList.add('selected');
    
    pin.style.left = `${coords.x}%`;
    pin.style.top = `${coords.y}%`;
    pin.setAttribute('data-id', place.id);
    pin.setAttribute('title', place.name);

    pin.innerHTML = `<div class="map-pin-dot"></div>`;

    // Click handler for pin
    pin.addEventListener('click', (e) => {
      e.stopPropagation();
      selectPlace(place.id);
    });

    DOM.mapSvgContainer.appendChild(pin);
  });

  // Render places list
  renderPlacesList(activePlaces);

  // Render detail panel
  renderPlaceDetails();
}

function renderPlacesList(activePlaces) {
  if (!DOM.mapPlacesList) return;
  DOM.mapPlacesList.innerHTML = '';
  
  const searchVal = DOM.mapPlacesSearch ? DOM.mapPlacesSearch.value.trim().toLowerCase() : '';
  
  // Filter places by active map type and search query
  const filteredPlaces = state.biblicalPlaces.filter(place => {
    const matchesMap = place.maps[state.activeMapType] !== null;
    const matchesSearch = place.name.toLowerCase().includes(searchVal) || 
                          place.region.toLowerCase().includes(searchVal);
    return matchesMap && matchesSearch;
  });

  if (filteredPlaces.length === 0) {
    DOM.mapPlacesList.innerHTML = `
      <div class="empty-state" style="padding: 1rem;">
        <i class="fas fa-map-pin empty-state-icon" style="font-size: 1.5rem;"></i>
        <p style="font-size: 0.75rem;">No locations found.</p>
      </div>
    `;
    return;
  }

  // Sort by active first, then alphabetically
  const currentBook = state.bibleData ? state.bibleData[state.currentBookIndex].name : "";
  const currentChapterNum = state.currentChapterIndex + 1;
  
  filteredPlaces.sort((a, b) => {
    const aActive = a.occurrences[currentBook] && a.occurrences[currentBook].includes(currentChapterNum);
    const bActive = b.occurrences[currentBook] && b.occurrences[currentBook].includes(currentChapterNum);
    if (aActive && !bActive) return -1;
    if (!aActive && bActive) return 1;
    return a.name.localeCompare(b.name);
  });

  filteredPlaces.forEach(place => {
    const isActive = place.occurrences[currentBook] && place.occurrences[currentBook].includes(currentChapterNum);
    const isSelected = state.selectedPlaceId === place.id;
    
    const item = document.createElement('div');
    item.className = 'map-place-item';
    if (isSelected) item.classList.add('selected');
    item.setAttribute('data-id', place.id);

    let badgeHtml = '';
    if (isActive) {
      badgeHtml = `<span class="map-place-badge">Mentioned</span>`;
    }

    item.innerHTML = `
      <div class="map-place-text-group">
        <span class="map-place-name">${place.name}</span>
        <span class="map-place-region">${place.region}</span>
      </div>
      ${badgeHtml}
    `;

    item.addEventListener('click', () => {
      selectPlace(place.id);
    });

    DOM.mapPlacesList.appendChild(item);
  });
}

function selectPlace(placeId) {
  state.selectedPlaceId = placeId;
  
  // Re-render map pins & places list to show selected state
  updateMapsTab();
  
  // Scroll list item into view if it exists
  if (DOM.mapPlacesList) {
    const selectedItem = DOM.mapPlacesList.querySelector(`.map-place-item[data-id="${placeId}"]`);
    if (selectedItem) {
      selectedItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }
}

function renderPlaceDetails() {
  if (!DOM.mapInfoPanel) return;

  if (!state.selectedPlaceId) {
    // Check if there are active places in the chapter, if so show the first one
    const currentBook = state.bibleData ? state.bibleData[state.currentBookIndex].name : "";
    const currentChapterNum = state.currentChapterIndex + 1;
    const activePlaces = state.biblicalPlaces.filter(place => {
      return place.maps[state.activeMapType] !== null &&
             place.occurrences[currentBook] && 
             place.occurrences[currentBook].includes(currentChapterNum);
    });
    
    if (activePlaces.length > 0) {
      const firstActive = activePlaces[0];
      DOM.mapInfoPanel.innerHTML = `
        <div class="map-info-header">
          <h4 class="map-info-title">${firstActive.name}</h4>
          <span class="map-info-badge">In Chapter</span>
        </div>
        <div class="map-info-region">${firstActive.region}</div>
        <p class="map-info-sig">${firstActive.significance}</p>
        <span class="map-info-ref" data-ref="${firstActive.ref}"><i class="fas fa-book-open"></i> Key Scripture: ${firstActive.ref}</span>
      `;
      
      const refLink = DOM.mapInfoPanel.querySelector('.map-info-ref');
      if (refLink) {
        refLink.addEventListener('click', () => {
          handleScriptureLinkClick(firstActive.ref);
        });
      }
      return;
    }
    
    DOM.mapInfoPanel.innerHTML = `
      <div class="map-info-placeholder">
        <i class="fas fa-circle-info" style="color: var(--accent-color);"></i>
        Select a location on the map or search below to explore.
      </div>
    `;
    return;
  }

  const place = state.biblicalPlaces.find(p => p.id === state.selectedPlaceId);
  if (!place) return;

  const currentBook = state.bibleData ? state.bibleData[state.currentBookIndex].name : "";
  const currentChapterNum = state.currentChapterIndex + 1;
  const isActive = place.occurrences[currentBook] && place.occurrences[currentBook].includes(currentChapterNum);

  let badgeHtml = '';
  if (isActive) {
    badgeHtml = `<span class="map-info-badge">In Chapter</span>`;
  }

  DOM.mapInfoPanel.innerHTML = `
    <div class="map-info-header">
      <h4 class="map-info-title">${place.name}</h4>
      ${badgeHtml}
    </div>
    <div class="map-info-region">${place.region}</div>
    <p class="map-info-sig">${place.significance}</p>
    <span class="map-info-ref" data-ref="${place.ref}"><i class="fas fa-book-open"></i> Key Scripture: ${place.ref}</span>
  `;

  const refLink = DOM.mapInfoPanel.querySelector('.map-info-ref');
  if (refLink) {
    refLink.addEventListener('click', () => {
      handleScriptureLinkClick(place.ref);
    });
  }
}

function handleScriptureLinkClick(refString) {
  if (!refString) return;
  const firstRef = refString.split(',')[0].trim();
  const regex = /^(\d?\s*[a-zA-Z\s]+?)\s+(\d+)(?::(\d+))?$/;
  const match = firstRef.match(regex);
  if (!match) return;

  const bookNameQuery = match[1].trim().toLowerCase();
  const chapNum = parseInt(match[2], 10);
  const verseNum = match[3] ? parseInt(match[3], 10) : 1;

  const bookIdx = state.bibleData.findIndex(b => {
    const bName = b.name.toLowerCase();
    return bName === bookNameQuery || bName.startsWith(bookNameQuery) || bookNameQuery.startsWith(bName);
  });

  if (bookIdx !== -1) {
    navigateToScripture(bookIdx, chapNum - 1, verseNum - 1);
    if (window.innerWidth <= 1024) {
      DOM.sidebarRight.classList.add('study-drawer-collapsed');
    }
  }
}
