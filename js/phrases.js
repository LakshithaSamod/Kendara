/*
 * phrases.js - every sentence of the plain reading, in English ("en") and Sinhala ("si").
 *
 * Each Sinhala message is written as its own natural sentence (not translated word by
 * word). To change wording, edit the text here; {p}, {theme}, {a} etc. are filled in by
 * simple.js. Numbered keys (1-12) are houses; MOOD/DO_BY_MOOD are keyed by the house the
 * Moon is in, STAR by tara (0 = Janma ... 8 = Parama Mitra).
 */
(function (root) {
  "use strict";
  (root.K || (root.K = {})).P = {
  PLANET: {
    "en": {
      "Sun": "Sun",
      "Moon": "Moon",
      "Mars": "Mars",
      "Mercury": "Mercury",
      "Jupiter": "Jupiter",
      "Venus": "Venus",
      "Saturn": "Saturn",
      "Rahu": "Rahu",
      "Ketu": "Ketu"
    },
    "si": {
      "Sun": "රවි",
      "Moon": "චන්ද්‍ර",
      "Mars": "කුජ",
      "Mercury": "බුධ",
      "Jupiter": "ගුරු",
      "Venus": "සිකුරු",
      "Saturn": "සෙනසුරු",
      "Rahu": "රාහු",
      "Ketu": "කේතු"
    }
  },
  SIGN_SI: [
    "මේෂ",
    "වෘෂභ",
    "මිථුන",
    "කටක",
    "සිංහ",
    "කන්‍යා",
    "තුලා",
    "වෘශ්චික",
    "ධනු",
    "මකර",
    "කුම්භ",
    "මීන"
  ],
  WEEKDAY: {
    "en": [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday"
    ],
    "si": [
      "සඳුදා",
      "අඟහරුවාදා",
      "බදාදා",
      "බ්‍රහස්පතින්දා",
      "සිකුරාදා",
      "සෙනසුරාදා",
      "ඉරිදා"
    ]
  },
  MONTH: {
    "en": [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December"
    ],
    "si": [
      "ජනවාරි",
      "පෙබරවාරි",
      "මාර්තු",
      "අප්‍රේල්",
      "මැයි",
      "ජූනි",
      "ජූලි",
      "අගෝස්තු",
      "සැප්තැම්බර්",
      "ඔක්තෝබර්",
      "නොවැම්බර්",
      "දෙසැම්බර්"
    ]
  },
  THEME: {
    "en": {
      "1": "you and your health",
      "2": "money and family",
      "3": "courage and communication",
      "4": "home and peace of mind",
      "5": "love, children and studies",
      "6": "work, debts and problems",
      "7": "marriage and your partner",
      "8": "sudden changes and private matters",
      "9": "luck, father and faith",
      "10": "career and reputation",
      "11": "gains and friends",
      "12": "expenses, rest and foreign places"
    },
    "si": {
      "1": "ඔබේ සෞඛ්‍යය හා පෞරුෂය",
      "2": "මුදල් හා පවුල",
      "3": "ධෛර්යය හා කතාබහ",
      "4": "නිවස හා සිතේ සැනසීම",
      "5": "ආදරය, දරුවන් හා අධ්‍යාපනය",
      "6": "රැකියාව, ණය හා ගැටලු",
      "7": "විවාහය හා සහකරු",
      "8": "හදිසි වෙනස්කම් හා පෞද්ගලික කරුණු",
      "9": "වාසනාව, පියා හා ආගම",
      "10": "රැකියාව හා කීර්තිය",
      "11": "ලාභ හා මිතුරන්",
      "12": "වියදම්, විවේකය හා විදෙස් රටවල්"
    }
  },
  THEME_SHORT: {
    "en": {
      "1": "yourself",
      "2": "money and family",
      "3": "courage and communication",
      "4": "home",
      "5": "love and children",
      "6": "daily work and problems",
      "7": "marriage and partnership",
      "8": "sudden changes",
      "9": "luck and faith",
      "10": "career",
      "11": "gains and friends",
      "12": "expenses and rest"
    },
    "si": {
      "1": "ඔබ ගැනම",
      "2": "මුදල් හා පවුල",
      "3": "ධෛර්යය හා කතාබහ",
      "4": "නිවස",
      "5": "ආදරය හා දරුවන්",
      "6": "දෛනික වැඩ හා ගැටලු",
      "7": "විවාහය හා සහකරු",
      "8": "හදිසි වෙනස්කම්",
      "9": "වාසනාව හා ආගම",
      "10": "රැකියාව හා කීර්තිය",
      "11": "ලාභ හා මිතුරන්",
      "12": "වියදම් හා විවේකය"
    }
  },
  MOOD: {
    "en": {
      "1": "You'll be more focused on yourself today - your health, your looks and how you feel.",
      "2": "Money, family and food are on your mind today. Choose your words carefully.",
      "3": "A good day to speak up, make calls, send messages or take a short trip.",
      "4": "You'll want comfort and quiet today. Time at home with family helps.",
      "5": "Your heart feels lighter - romance, creativity and fun come easily.",
      "6": "A day for getting work done and sorting out problems. Look after your health too.",
      "7": "Your partner and close relationships are in focus today.",
      "8": "Feelings run deep today. Keep private things private and avoid risks.",
      "9": "A good day for learning, advice from elders and spiritual things.",
      "10": "Work and responsibilities take centre stage today.",
      "11": "Friends, gains and good news are favoured today.",
      "12": "You may feel tired or want to be alone. Rest, and avoid overspending."
    },
    "si": {
      "1": "අද ඔබේ අවධානය වැඩිපුරම ඔබ ගැනම යොමු වේ - ඔබේ සෞඛ්‍යය, පෙනුම හා ඔබට දැනෙන ආකාරය.",
      "2": "අද මුදල්, පවුල හා කෑම බීම ගැන සිතුවිලි වැඩියි. කතා කරන විට වචන ගැන සැලකිලිමත් වන්න.",
      "3": "අදහස් ප්‍රකාශ කිරීමට, ඇමතුම් ගැනීමට, පණිවිඩ යැවීමට හෝ කෙටි ගමනක් යාමට හොඳ දවසක්.",
      "4": "අද ඔබට සැනසීම හා නිස්කලංක බව වැඩියෙන් අවශ්‍ය වේ. පවුලේ අය සමඟ නිවසේ කාලය ගත කිරීම හොඳයි.",
      "5": "අද හිත සැහැල්ලුයි - ආදරය, නිර්මාණශීලී වැඩ හා විනෝදය පහසුවෙන් ගලා එයි.",
      "6": "වැඩ නිම කිරීමට හා ගැටලු විසඳීමට හොඳ දවසක්. සෞඛ්‍යය ගැනත් සැලකිලිමත් වන්න.",
      "7": "අද ඔබේ සහකරු හා සමීප සබඳතා කෙරෙහි අවධානය වැඩියි.",
      "8": "අද හැඟීම් ගැඹුරුයි. පෞද්ගලික දේ තමන් ළඟම තබා ගන්න; අවදානම් ගන්න එපා.",
      "9": "ඉගෙනීමට, වැඩිහිටියන්ගේ උපදෙස් ලබා ගැනීමට හා ආගමික කටයුතුවලට හොඳ දවසක්.",
      "10": "අද රැකියාව හා වගකීම් ප්‍රධාන තැනක් ගනී.",
      "11": "අද මිතුරන්, ලාභ හා සුබ ආරංචි සඳහා හොඳ දවසක්.",
      "12": "අද වෙහෙසක් දැනෙන්නත්, තනියම ඉන්න හිතෙන්නත් පුළුවන්. විවේක ගන්න; අනවශ්‍ය වියදම් අඩු කරන්න."
    }
  },
  STAR: {
    "en": [
      "It's your own birth-star day - look after yourself and avoid big risks.",
      "The stars favour money and effort today - a good day to start things.",
      "Small obstacles are possible - better to finish old work than start something new.",
      "A safe, comfortable day - good for health and steady work.",
      "You may meet some resistance - stay flexible and avoid arguments.",
      "A good day to work towards your goals and get things done.",
      "The most delicate day in your cycle - rest, take care and put off big decisions.",
      "Friends and helpful people are on your side today.",
      "One of the luckiest days in your cycle - people are ready to support you."
    ],
    "si": [
      "අද ඔබේ උපන් නැකත යෙදෙන දවසයි - ඔබ ගැනම සැලකිලිමත් වන්න; ලොකු අවදානම් ගන්න එපා.",
      "අද මුදල් කටයුතුවලට හා උත්සාහයට නැකත් හිතකරයි - අලුත් දෙයක් පටන් ගැනීමට හොඳ දවසක්.",
      "පොඩි බාධා ඇති විය හැකියි - අලුත් දේ පටන් ගන්නවාට වඩා පරණ වැඩ අවසන් කිරීම හොඳයි.",
      "සුරක්ෂිත, සුවපහසු දවසක් - සෞඛ්‍යයට හා නිතිපතා කරන වැඩවලට හොඳයි.",
      "යම් විරෝධතා මතු විය හැකියි - නම්‍යශීලීව සිටින්න; වාද විවාදවලින් වළකින්න.",
      "ඔබේ ඉලක්ක කරා වැඩ කිරීමට හා කටයුතු සාර්ථක කර ගැනීමට හොඳ දවසක්.",
      "ඔබේ නැකත් චක්‍රයේ වඩාත්ම සියුම් දවසයි - විවේක ගන්න, පරිස්සම් වන්න, ලොකු තීරණ කල් දමන්න.",
      "අද මිතුරන් හා උදව් කරන අය ඔබේ පැත්තේ සිටිති.",
      "ඔබේ නැකත් චක්‍රයේ වාසනාවන්තම දවස්වලින් එකක් - අනුන්ගෙන් හොඳ සහයෝගයක් ලැබේ."
    ]
  },
  HEADLINE: {
    "en": {
      "Excellent": "A great day for you",
      "Good": "A good day for you",
      "Mixed": "An ordinary, mixed day",
      "Careful": "A day to go carefully",
      "Quiet & cautious": "A day to take things slowly"
    },
    "si": {
      "Excellent": "ඔබට ඉතා හොඳ දවසක්",
      "Good": "ඔබට හොඳ දවසක්",
      "Mixed": "සාමාන්‍ය, මිශ්‍ර දවසක්",
      "Careful": "ප්‍රවේසමෙන් ගත කළ යුතු දවසක්",
      "Quiet & cautious": "සෙමින්, ඉවසීමෙන් ගත කළ යුතු දවසක්"
    }
  },
  SHORT: {
    "en": {
      "Excellent": "Great",
      "Good": "Good",
      "Mixed": "Okay",
      "Careful": "Careful",
      "Quiet & cautious": "Slow down"
    },
    "si": {
      "Excellent": "ඉතා හොඳයි",
      "Good": "හොඳයි",
      "Mixed": "සාමාන්‍යයි",
      "Careful": "පරිස්සමින්",
      "Quiet & cautious": "සෙමින්"
    }
  },
  TONE: {
    "en": {
      "supportive": "Good",
      "mixed": "Okay",
      "testing": "Take care"
    },
    "si": {
      "supportive": "හොඳයි",
      "mixed": "සාමාන්‍යයි",
      "testing": "පරිස්සමින්"
    }
  },
  AREA_TITLE: {
    "en": {
      "love": "Love & relationships",
      "career": "Work & career",
      "money": "Money",
      "health": "Health & energy",
      "mind": "Mind & communication",
      "home": "Home & family"
    },
    "si": {
      "love": "ආදරය හා සබඳතා",
      "career": "රැකියාව",
      "money": "මුදල්",
      "health": "සෞඛ්‍යය හා ශක්තිය",
      "mind": "සිතුවිලි හා කතාබහ",
      "home": "නිවස හා පවුල"
    }
  },
  AREA_BASE: {
    "en": {
      "love": {
        "supportive": "Love and closeness come easily. A good time to show your feelings.",
        "mixed": "Relationships are steady but need care. Be patient and kind.",
        "testing": "Love may feel slow or confusing right now. Talk honestly and don't rush decisions."
      },
      "career": {
        "supportive": "Work goes well - your effort gets noticed.",
        "mixed": "Work is steady. Do your part well without pushing too hard.",
        "testing": "Work may feel heavy or slow. Stay patient and organised."
      },
      "money": {
        "supportive": "Money matters look good - gains are possible.",
        "mixed": "Money is stable. Spend wisely.",
        "testing": "Be careful with money - avoid big spending, lending or risky deals."
      },
      "health": {
        "supportive": "Your energy is good. Keep up your routine.",
        "mixed": "Energy is fine - rest well and eat on time.",
        "testing": "You may feel tired or stressed. Rest properly and don't overdo things."
      },
      "mind": {
        "supportive": "Your mind is sharp - good for studies, talks and messages.",
        "mixed": "Think before you speak and double-check the details.",
        "testing": "Misunderstandings happen easily now - read twice, speak gently."
      },
      "home": {
        "supportive": "Home and family bring you happiness.",
        "mixed": "Family life is calm, with a few small things to handle.",
        "testing": "Small tensions at home are possible - stay calm and listen."
      }
    },
    "si": {
      "love": {
        "supportive": "ආදරය හා සමීපකම පහසුවෙන් ගලා යයි. ඔබේ හැඟීම් ප්‍රකාශ කිරීමට හොඳ කාලයක්.",
        "mixed": "සබඳතා ස්ථාවරයි, නමුත් සැලකිල්ල අවශ්‍යයි. ඉවසීමෙන් හා කරුණාවෙන් කටයුතු කරන්න.",
        "testing": "ආදර කටයුතු දැන් ටිකක් සෙමින් හෝ අවුල් සහගතව දැනිය හැකියි. අවංකව කතා කරන්න; තීරණ ගැනීමට ඉක්මන් වෙන්න එපා."
      },
      "career": {
        "supportive": "රැකියා කටයුතු හොඳින් සිදු වේ - ඔබේ උත්සාහය අනුන්ගේ ඇස ගැටේ.",
        "mixed": "රැකියාව ස්ථාවරයි. ඕනෑවට වඩා තද නොකර ඔබේ කොටස හොඳින් කරන්න.",
        "testing": "වැඩ කටයුතු බරක් හෝ ප්‍රමාදයක් ලෙස දැනිය හැකියි. ඉවසීමෙන්, පිළිවෙළට කටයුතු කරන්න."
      },
      "money": {
        "supportive": "මුදල් කටයුතු යහපත් - ලාභ ලැබීමේ ඉඩක් තිබේ.",
        "mixed": "මුදල් තත්ත්වය ස්ථාවරයි. බුද්ධිමත්ව වියදම් කරන්න.",
        "testing": "මුදල් ගැන පරිස්සම් වන්න - ලොකු වියදම්, ණයට දීම හා අවදානම් ගනුදෙනුවලින් වළකින්න."
      },
      "health": {
        "supportive": "ඔබේ ශක්තිය හොඳ මට්ටමක පවතී. ඔබේ දින චර්යාව දිගටම පවත්වා ගන්න.",
        "mixed": "ශක්තිය සාමාන්‍යයි - හොඳින් විවේක ගන්න, වේලාවට කෑම ගන්න.",
        "testing": "වෙහෙස හෝ ආතතිය දැනිය හැකියි. හොඳින් විවේක ගන්න; ඕනෑවට වඩා මහන්සි වෙන්න එපා."
      },
      "mind": {
        "supportive": "ඔබේ මනස තියුණුයි - ඉගෙනීමට, කතාබහට හා පණිවිඩවලට හොඳයි.",
        "mixed": "කතා කිරීමට පෙර සිතන්න; විස්තර නැවත පරීක්ෂා කරන්න.",
        "testing": "වැරදි වැටහීම් පහසුවෙන් ඇති විය හැකියි - දෙවරක් කියවන්න, මෘදුව කතා කරන්න."
      },
      "home": {
        "supportive": "නිවස හා පවුල ඔබට සතුට ගෙන දෙයි.",
        "mixed": "පවුල් ජීවිතය සන්සුන්යි; බලා ගත යුතු පොඩි කාරණා කිහිපයක් තිබේ.",
        "testing": "නිවසේ පොඩි ආතතීන් ඇති විය හැකියි - සන්සුන්ව සිටින්න, අනුන්ට සවන් දෙන්න."
      }
    }
  },
  REASON: {
    "en": {
      "Jupiter": [
        "Jupiter, the planet of luck, is helping here.",
        "Jupiter is here, but its help comes slowly."
      ],
      "Saturn": [
        "Saturn rewards steady effort here.",
        "Saturn is slowing things down here - patience pays off."
      ],
      "Mars": [
        "Mars gives you energy and courage here.",
        "Mars brings heat here - watch your temper."
      ],
      "Venus": [
        "Venus brings sweetness and harmony.",
        "Venus makes feelings a little complicated."
      ],
      "Sun": [
        "The Sun brings you recognition.",
        "The Sun can stir up ego clashes."
      ],
      "Mercury": [
        "Mercury helps with clear talks and smart decisions.",
        "Mercury can cause small misunderstandings."
      ],
      "Rahu": [
        "Rahu can bring unexpected chances.",
        "Rahu can bring restlessness or confusion."
      ],
      "Ketu": [
        "Ketu helps you let go of what is finished.",
        "Ketu can make you feel distant or uninterested."
      ]
    },
    "si": {
      "Jupiter": [
        "වාසනාවේ ග්‍රහයා වන ගුරු මෙහිදී ඔබට උදව් කරයි.",
        "ගුරු මෙහි සිටියත්, ඔහුගේ උදව් ලැබෙන්නේ සෙමිනි."
      ],
      "Saturn": [
        "නොකඩවා කරන උත්සාහයට සෙනසුරු මෙහිදී ප්‍රතිඵල දෙයි.",
        "සෙනසුරු මෙහිදී දේවල් ප්‍රමාද කරයි - ඉවසීම අවසානයේ ප්‍රතිඵල දෙයි."
      ],
      "Mars": [
        "කුජ මෙහිදී ඔබට ශක්තිය හා ධෛර්යය දෙයි.",
        "කුජ මෙහිදී උණුසුමක් ඇති කරයි - කේන්තිය පාලනය කර ගන්න."
      ],
      "Venus": [
        "සිකුරු මිහිරියාව හා සමගිය ගෙන එයි.",
        "සිකුරු නිසා හැඟීම් ටිකක් සංකීර්ණ විය හැකියි."
      ],
      "Sun": [
        "රවි ඔබට පිළිගැනීමක් ගෙන එයි.",
        "රවි නිසා මමත්වය හා ගැටුම් මතු විය හැකියි."
      ],
      "Mercury": [
        "පැහැදිලි කතාබහට හා නුවණැති තීරණවලට බුධ උදව් කරයි.",
        "බුධ නිසා පොඩි වැරදි වැටහීම් ඇති විය හැකියි."
      ],
      "Rahu": [
        "රාහු අනපේක්ෂිත අවස්ථා ගෙන එයි.",
        "රාහු නිසා නොසන්සුන්කම හෝ අවුල් සහගත බවක් ඇති විය හැකියි."
      ],
      "Ketu": [
        "අවසන් වූ දේ අත්හැරීමට කේතු උදව් කරයි.",
        "කේතු නිසා උනන්දුව අඩු වීම හෝ ඈත් වූ බවක් දැනිය හැකියි."
      ]
    }
  },
  RETRO: {
    "en": "{p} is moving backwards right now - a time to review and fix things, not to rush.",
    "si": "{p} දැන් පසුපසට ගමන් කරයි (වක්‍ර) - ඉක්මන් නොවී, පසු බලා දේවල් හදා ගැනීමට කාලයයි."
  },
  VENUS_RETRO_LOVE: {
    "en": "The love planet Venus is moving backwards, so old feelings or past connections may come back.",
    "si": "ආදරයේ ග්‍රහයා වන සිකුරු දැන් පසුපසට ගමන් කරයි; එබැවින් පරණ හැඟීම් හෝ පැරණි සබඳතා නැවත මතු විය හැකියි."
  },
  MOON_IN: {
    "en": [
      "Your feelings support this today.",
      "Your feelings are sensitive here today - listen more than you push."
    ],
    "si": [
      "අද ඔබේ හැඟීම් මේ කටයුතුවලට උදව් වේ.",
      "අද මේ ගැන ඔබේ හැඟීම් සංවේදීයි - තද කරනවාට වඩා සවන් දෙන්න."
    ]
  },
  DO_BY_MOOD: {
    "en": {
      "1": "Take care of yourself - exercise, grooming and rest.",
      "2": "Plan your budget; enjoy a meal with family.",
      "3": "Make that call or send that message.",
      "4": "Spend time at home and tidy your space.",
      "5": "Do something creative or fun; spend time with someone you love.",
      "6": "Clear pending work; book that health check.",
      "7": "Give time to your partner or the people closest to you.",
      "8": "Reflect quietly; handle private matters carefully.",
      "9": "Visit a place of worship, read, or ask an elder for advice.",
      "10": "Focus on work and your responsibilities.",
      "11": "Meet friends; follow up on money owed to you.",
      "12": "Go to bed early; keep spending low."
    },
    "si": {
      "1": "ඔබ ගැනම සැලකිලිමත් වන්න - ව්‍යායාම, පිළිවෙළ හා විවේකය.",
      "2": "මුදල් සැලසුම් කරන්න; පවුලේ අය සමඟ ආහාර වේලක් රස විඳින්න.",
      "3": "ගන්න හිතාගෙන හිටපු ඇමතුම ගන්න, යවන්න ඕන පණිවිඩය යවන්න.",
      "4": "නිවසේ කාලය ගත කරන්න; ඔබේ ඉඩ පිළිවෙළ කරන්න.",
      "5": "නිර්මාණශීලී හෝ විනෝදජනක දෙයක් කරන්න; ඔබ ආදරය කරන කෙනෙකු සමඟ කාලය ගත කරන්න.",
      "6": "ඉතිරි වී ඇති වැඩ අවසන් කරන්න; සෞඛ්‍ය පරීක්ෂාවක් කරවා ගන්න.",
      "7": "ඔබේ සහකරුට හෝ ඔබට සමීපතම අයට කාලය දෙන්න.",
      "8": "නිහඬව සිතා බලන්න; පෞද්ගලික කටයුතු පරිස්සමින් කරන්න.",
      "9": "ආගමික ස්ථානයකට යන්න, යමක් කියවන්න, නැත්නම් වැඩිහිටියෙකුගෙන් උපදෙස් ගන්න.",
      "10": "රැකියාව හා ඔබේ වගකීම් කෙරෙහි අවධානය යොමු කරන්න.",
      "11": "මිතුරන් හමු වන්න; ඔබට ලැබිය යුතු මුදල් ගැන සොයා බලන්න.",
      "12": "කලින් නින්දට යන්න; වියදම් අඩුවෙන් තබා ගන්න."
    }
  },
  T: {
    "en": {
      "range": "{a} - {b}",
      "rahu_note": "Don't start important things in this window.",
      "no_best": "No especially strong time today - keep a steady pace.",
      "rahu": "Avoid starting important things during Rahu Kalam ({a} - {b}).",
      "chandrashtama": "The Moon is in a sensitive spot for you today - stay calm, and avoid arguments and long trips.",
      "start_new": "A good day to start something new.",
      "ask_help": "Ask for help - people are happy to support you.",
      "avoid_new": "Starting big new things today.",
      "avoid_rahu": "Starting important things during Rahu Kalam ({a} - {b}).",
      "avoid_love": "Rushing big love decisions.",
      "avoid_msgs": "Signing papers or sending messages without double-checking.",
      "avoid_fight": "Arguments and long journeys.",
      "sade_sati": "You are going through Saturn's 7½-year period (Sade Sati). It asks for patience and hard work - it is not bad luck.",
      "jup_good": "Jupiter, the planet of luck, is in a helpful position for you.",
      "jup_quiet": "Jupiter's help is quieter right now, so steady effort matters more.",
      "chapter": "From {a} to {b} you are in the {p} period. In your chart {p} is linked to {themes}, so these years focus on those things.",
      "sub": "Until {b}, the {p} sub-period adds focus on {themes}.",
      "sub_same": "Right now you are in the first part of this period ({p}-{p}, until {b}), when its themes are felt most strongly.",
      "and": "and",
      "ing": "{p} moves into your area of {theme}, bringing {effect} there.",
      "retro_ev": "{p} starts moving backwards - slow down on matters of {theme}.",
      "direct_ev": "{p} moves forward again - delays around {theme} begin to clear.",
      "full": "Full Moon (Poya) - feelings peak around {theme}.",
      "new": "New Moon - a quiet time to plan around {theme}.",
      "eclipse_solar": "Solar eclipse - avoid starting important things. It touches {theme}.",
      "eclipse_lunar": "Lunar eclipse - avoid starting important things. It touches {theme}.",
      "month_focus": "This month's main focus: {theme}.",
      "month_overall": "Overall the month feels {word}.",
      "week": "Mostly {word}. Best day: {best}. Go gently on {low}.",
      "year_best": "The brightest months look like {best}. Go more gently in {worst}.",
      "card": "Focus: {theme}.",
      "journey": "{p} ({role}): {path}.",
      "journey_seg": "{theme} from {date}",
      "then": ", then ",
      "dasha_change": "{date}: the {p} sub-period begins - focus shifts to {themes}."
    },
    "si": {
      "range": "{a} - {b}",
      "rahu_note": "මෙම කාලයේ වැදගත් කටයුතු පටන් ගන්න එපා.",
      "no_best": "අද විශේෂයෙන් ශක්තිමත් වේලාවක් නැත - සාමාන්‍ය වේගයෙන් කටයුතු කරන්න.",
      "rahu": "රාහු කාලයේ ({a} - {b}) වැදගත් කටයුතු පටන් ගන්න එපා.",
      "chandrashtama": "අද සඳ ඔබට සංවේදී තැනක සිටී (චන්ද්‍රාෂ්ටමය) - සන්සුන්ව සිටින්න; වාද විවාද හා දිගු ගමන්වලින් වළකින්න.",
      "start_new": "අලුත් දෙයක් ආරම්භ කිරීමට හොඳ දවසක්.",
      "ask_help": "උදව් ඉල්ලන්න - අනුන් ඔබට උදව් කිරීමට කැමැත්තෙන් සිටිති.",
      "avoid_new": "අද ලොකු අලුත් දේවල් පටන් ගැනීම.",
      "avoid_rahu": "රාහු කාලයේ ({a} - {b}) වැදගත් කටයුතු ආරම්භ කිරීම.",
      "avoid_love": "ආදරය ගැන ලොකු තීරණ ඉක්මනින් ගැනීම.",
      "avoid_msgs": "දෙවරක් පරීක්ෂා නොකර ලියකියවිලි අත්සන් කිරීම හෝ පණිවිඩ යැවීම.",
      "avoid_fight": "වාද විවාද හා දිගු ගමන්.",
      "sade_sati": "ඔබ දැන් සෙනසුරුගේ අවුරුදු හත්හමාරක කාලය (සාඩේසාතිය) පසු කරයි. මෙය අවාසනාවක් නොව, ඉවසීම හා කැපවීම ඉල්ලා සිටින කාලයකි.",
      "jup_good": "වාසනාවේ ග්‍රහයා වන ගුරු දැන් ඔබට හිතකර තැනක සිටී.",
      "jup_quiet": "ගුරුගේ උදව් දැන් නිහඬව ක්‍රියා කරයි, එබැවින් නොකඩවා කරන උත්සාහය වඩාත් වැදගත් වේ.",
      "chapter": "{a} සිට {b} දක්වා ඔබ ගත කරන්නේ {p} දශාවයි. ඔබේ කේන්දරයේ {p} {themes} සමඟ සම්බන්ධ නිසා, මේ අවුරුදුවල අවධානය ඒ දේවල් වෙත යොමු වේ.",
      "sub": "{b} දක්වා ගත වන {p} අන්තර්දශාව, {themes} කෙරෙහි ද අවධානය යොමු කරයි.",
      "sub_same": "දැන් ගත වන්නේ මෙම දශාවේ පළමු කොටසයි ({p}-{p}, {b} දක්වා); එබැවින් එහි ලක්ෂණ මේ කාලයේ වඩාත් තදින් දැනේ.",
      "and": "සහ",
      "ing": "{p} ඔබේ {theme} පිළිබඳ ක්ෂේත්‍රයට පිවිසෙයි - එහි {effect} ගෙන එයි.",
      "retro_ev": "{p} පසුපසට ගමන් කිරීම අරඹයි - {theme} සම්බන්ධ කටයුතුවලදී ඉක්මන් නොවන්න.",
      "direct_ev": "{p} නැවත ඉදිරියට ගමන් කරයි - {theme} සම්බන්ධ ප්‍රමාද ඉවත් වීමට පටන් ගනී.",
      "full": "පසළොස්වක පෝය - {theme} සම්බන්ධ හැඟීම් උච්චතම වේ.",
      "new": "අමාවක - {theme} ගැන සැලසුම් කිරීමට නිහඬ කාලයක්.",
      "eclipse_solar": "සූර්ය ග්‍රහණය - වැදගත් දේ පටන් ගැනීමෙන් වළකින්න. එය {theme} සමඟ සම්බන්ධයි.",
      "eclipse_lunar": "චන්ද්‍ර ග්‍රහණය - වැදගත් දේ පටන් ගැනීමෙන් වළකින්න. එය {theme} සමඟ සම්බන්ධයි.",
      "month_focus": "මේ මාසයේ ප්‍රධාන අවධානය: {theme}.",
      "month_overall": "සමස්තයක් ලෙස මාසය {word}.",
      "week": "බොහෝ දුරට {word}. හොඳම දවස: {best}. {low} දින පරිස්සමින් ඉන්න.",
      "year_best": "වඩාත් හොඳ මාස ලෙස පෙනෙන්නේ {best} ය. {worst} මාසවල වඩා පරිස්සමින් ඉන්න.",
      "card": "ප්‍රධාන අවධානය: {theme}.",
      "journey": "{p} ({role}): {path}.",
      "journey_seg": "{date} සිට {theme}",
      "then": ", ඉන්පසු ",
      "dasha_change": "{date}: {p} අන්තර්දශාව ආරම්භ වේ - අවධානය {themes} වෙත යොමු වේ."
    }
  },
  EFFECT: {
    "en": {
      "Jupiter": "luck and growth",
      "Saturn": "slow, steady pressure",
      "Mars": "energy and heat",
      "Venus": "love and comfort",
      "Sun": "attention",
      "Mercury": "talk and thinking",
      "Rahu": "restless desires",
      "Ketu": "a sense of letting go"
    },
    "si": {
      "Jupiter": "වාසනාව හා දියුණුව",
      "Saturn": "සෙමින් එන, ස්ථාවර පීඩනයක්",
      "Mars": "ශක්තිය හා උණුසුම",
      "Venus": "ආදරය හා සුවපහසුව",
      "Sun": "අවධානය",
      "Mercury": "කතාබහ හා සිතුවිලි",
      "Rahu": "නොසන්සුන් ආශාවන්",
      "Ketu": "අත්හැරීමේ හැඟීමක්"
    }
  },
  ROLE: {
    "en": {
      "Jupiter": "luck and growth",
      "Saturn": "discipline and hard work",
      "Rahu": "desires and ambition",
      "Ketu": "letting go"
    },
    "si": {
      "Jupiter": "වාසනාව හා දියුණුව",
      "Saturn": "විනය හා වෙහෙස මහන්සිය",
      "Rahu": "ආශාවන් හා අභිලාෂ",
      "Ketu": "අත්හැරීම"
    }
  },
  WORD: {
    "en": {
      "Excellent": "very good",
      "Good": "good",
      "Mixed": "mixed",
      "Careful": "a little heavy",
      "Quiet & cautious": "slow"
    },
    "si": {
      "Excellent": "ඉතා හොඳයි",
      "Good": "හොඳයි",
      "Mixed": "මිශ්‍රයි",
      "Careful": "ටිකක් බරයි",
      "Quiet & cautious": "සෙමින් යයි"
    }
  },
  };
})(typeof window !== "undefined" ? window : globalThis);
