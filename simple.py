"""
simple.py
---------
Plain-language readings in English ("en") or Sinhala ("si").

readings.py does the astronomy and the traditional rules; this module only turns
those results into short, friendly sentences without technical terms (no house
numbers, degrees or "counted from the Moon"). Each Sinhala message is written as
its own natural sentence, not translated word by word.
"""

import readings as R

# ----------------------------------------------------------------------------
# Words
# ----------------------------------------------------------------------------

PLANET = {
    "en": {p: p for p in R.ORDER},
    "si": {"Sun": "රවි", "Moon": "චන්ද්‍ර", "Mars": "කුජ", "Mercury": "බුධ", "Jupiter": "ගුරු",
           "Venus": "සිකුරු", "Saturn": "සෙනසුරු", "Rahu": "රාහු", "Ketu": "කේතු"},
}
SIGN_SI = ["මේෂ", "වෘෂභ", "මිථුන", "කටක", "සිංහ", "කන්‍යා", "තුලා", "වෘශ්චික", "ධනු", "මකර",
           "කුම්භ", "මීන"]
WEEKDAY = {
    "en": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    "si": ["සඳුදා", "අඟහරුවාදා", "බදාදා", "බ්‍රහස්පතින්දා", "සිකුරාදා", "සෙනසුරාදා", "ඉරිදා"],
}
MONTH = {
    "en": ["January", "February", "March", "April", "May", "June", "July", "August",
           "September", "October", "November", "December"],
    "si": ["ජනවාරි", "පෙබරවාරි", "මාර්තු", "අප්‍රේල්", "මැයි", "ජූනි", "ජූලි", "අගෝස්තු",
           "සැප්තැම්බර්", "ඔක්තෝබර්", "නොවැම්බර්", "දෙසැම්බර්"],
}

# What each house is about, in everyday words
THEME = {
    "en": {1: "you and your health", 2: "money and family", 3: "courage and communication",
           4: "home and peace of mind", 5: "love, children and studies", 6: "work, debts and problems",
           7: "marriage and your partner", 8: "sudden changes and private matters",
           9: "luck, father and faith", 10: "career and reputation", 11: "gains and friends",
           12: "expenses, rest and foreign places"},
    "si": {1: "ඔබේ සෞඛ්‍යය හා පෞරුෂය", 2: "මුදල් හා පවුල", 3: "ධෛර්යය හා කතාබහ",
           4: "නිවස හා සිතේ සැනසීම", 5: "ආදරය, දරුවන් හා අධ්‍යාපනය", 6: "රැකියාව, ණය හා ගැටලු",
           7: "විවාහය හා සහකරු", 8: "හදිසි වෙනස්කම් හා පෞද්ගලික කරුණු",
           9: "වාසනාව, පියා හා ආගම", 10: "රැකියාව හා කීර්තිය", 11: "ලාභ හා මිතුරන්",
           12: "වියදම්, විවේකය හා විදෙස් රටවල්"},
}

# Short names for lists and events
THEME_SHORT = {
    "en": {1: "yourself", 2: "money and family", 3: "courage and communication", 4: "home",
           5: "love and children", 6: "daily work and problems", 7: "marriage and partnership",
           8: "sudden changes", 9: "luck and faith", 10: "career", 11: "gains and friends",
           12: "expenses and rest"},
    "si": {1: "ඔබ ගැනම", 2: "මුදල් හා පවුල", 3: "ධෛර්යය හා කතාබහ", 4: "නිවස",
           5: "ආදරය හා දරුවන්", 6: "දෛනික වැඩ හා ගැටලු", 7: "විවාහය හා සහකරු",
           8: "හදිසි වෙනස්කම්", 9: "වාසනාව හා ආගම", 10: "රැකියාව හා කීර්තිය", 11: "ලාභ හා මිතුරන්",
           12: "වියදම් හා විවේකය"},
}

# Today's mood, from the house the Moon is passing through
MOOD = {
    "en": {
        1: "You'll be more focused on yourself today - your health, your looks and how you feel.",
        2: "Money, family and food are on your mind today. Choose your words carefully.",
        3: "A good day to speak up, make calls, send messages or take a short trip.",
        4: "You'll want comfort and quiet today. Time at home with family helps.",
        5: "Your heart feels lighter - romance, creativity and fun come easily.",
        6: "A day for getting work done and sorting out problems. Look after your health too.",
        7: "Your partner and close relationships are in focus today.",
        8: "Feelings run deep today. Keep private things private and avoid risks.",
        9: "A good day for learning, advice from elders and spiritual things.",
        10: "Work and responsibilities take centre stage today.",
        11: "Friends, gains and good news are favoured today.",
        12: "You may feel tired or want to be alone. Rest, and avoid overspending.",
    },
    "si": {
        1: "අද ඔබේ අවධානය වැඩිපුරම ඔබ ගැනම යොමු වේ - ඔබේ සෞඛ්‍යය, පෙනුම හා ඔබට දැනෙන ආකාරය.",
        2: "අද මුදල්, පවුල හා කෑම බීම ගැන සිතුවිලි වැඩියි. කතා කරන විට වචන ගැන සැලකිලිමත් වන්න.",
        3: "අදහස් ප්‍රකාශ කිරීමට, ඇමතුම් ගැනීමට, පණිවිඩ යැවීමට හෝ කෙටි ගමනක් යාමට හොඳ දවසක්.",
        4: "අද ඔබට සැනසීම හා නිස්කලංක බව වැඩියෙන් අවශ්‍ය වේ. පවුලේ අය සමඟ නිවසේ කාලය ගත කිරීම හොඳයි.",
        5: "අද හිත සැහැල්ලුයි - ආදරය, නිර්මාණශීලී වැඩ හා විනෝදය පහසුවෙන් ගලා එයි.",
        6: "වැඩ නිම කිරීමට හා ගැටලු විසඳීමට හොඳ දවසක්. සෞඛ්‍යය ගැනත් සැලකිලිමත් වන්න.",
        7: "අද ඔබේ සහකරු හා සමීප සබඳතා කෙරෙහි අවධානය වැඩියි.",
        8: "අද හැඟීම් ගැඹුරුයි. පෞද්ගලික දේ තමන් ළඟම තබා ගන්න; අවදානම් ගන්න එපා.",
        9: "ඉගෙනීමට, වැඩිහිටියන්ගේ උපදෙස් ලබා ගැනීමට හා ආගමික කටයුතුවලට හොඳ දවසක්.",
        10: "අද රැකියාව හා වගකීම් ප්‍රධාන තැනක් ගනී.",
        11: "අද මිතුරන්, ලාභ හා සුබ ආරංචි සඳහා හොඳ දවසක්.",
        12: "අද වෙහෙසක් දැනෙන්නත්, තනියම ඉන්න හිතෙන්නත් පුළුවන්. විවේක ගන්න; අනවශ්‍ය වියදම් අඩු කරන්න.",
    },
}

# The day's star (tara bala), in plain words
STAR = {
    "en": [
        "It's your own birth-star day - look after yourself and avoid big risks.",
        "The stars favour money and effort today - a good day to start things.",
        "Small obstacles are possible - better to finish old work than start something new.",
        "A safe, comfortable day - good for health and steady work.",
        "You may meet some resistance - stay flexible and avoid arguments.",
        "A good day to work towards your goals and get things done.",
        "The most delicate day in your cycle - rest, take care and put off big decisions.",
        "Friends and helpful people are on your side today.",
        "One of the luckiest days in your cycle - people are ready to support you.",
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
        "ඔබේ නැකත් චක්‍රයේ වාසනාවන්තම දවස්වලින් එකක් - අනුන්ගෙන් හොඳ සහයෝගයක් ලැබේ.",
    ],
}

HEADLINE = {
    "en": {"Excellent": "A great day for you", "Good": "A good day for you",
           "Mixed": "An ordinary, mixed day", "Careful": "A day to go carefully",
           "Quiet & cautious": "A day to take things slowly"},
    "si": {"Excellent": "ඔබට ඉතා හොඳ දවසක්", "Good": "ඔබට හොඳ දවසක්",
           "Mixed": "සාමාන්‍ය, මිශ්‍ර දවසක්", "Careful": "ප්‍රවේසමෙන් ගත කළ යුතු දවසක්",
           "Quiet & cautious": "සෙමින්, ඉවසීමෙන් ගත කළ යුතු දවසක්"},
}
SHORT = {  # one-word day labels for the calendar
    "en": {"Excellent": "Great", "Good": "Good", "Mixed": "Okay", "Careful": "Careful",
           "Quiet & cautious": "Slow down"},
    "si": {"Excellent": "ඉතා හොඳයි", "Good": "හොඳයි", "Mixed": "සාමාන්‍යයි",
           "Careful": "පරිස්සමින්", "Quiet & cautious": "සෙමින්"},
}
TONE = {
    "en": {"supportive": "Good", "mixed": "Okay", "testing": "Take care"},
    "si": {"supportive": "හොඳයි", "mixed": "සාමාන්‍යයි", "testing": "පරිස්සමින්"},
}

AREA_TITLE = {
    "en": {"love": "Love & relationships", "career": "Work & career", "money": "Money",
           "health": "Health & energy", "mind": "Mind & communication", "home": "Home & family"},
    "si": {"love": "ආදරය හා සබඳතා", "career": "රැකියාව", "money": "මුදල්",
           "health": "සෞඛ්‍යය හා ශක්තිය", "mind": "සිතුවිලි හා කතාබහ", "home": "නිවස හා පවුල"},
}
AREA_BASE = {
    "en": {
        "love": {"supportive": "Love and closeness come easily. A good time to show your feelings.",
                 "mixed": "Relationships are steady but need care. Be patient and kind.",
                 "testing": "Love may feel slow or confusing right now. Talk honestly and don't rush decisions."},
        "career": {"supportive": "Work goes well - your effort gets noticed.",
                   "mixed": "Work is steady. Do your part well without pushing too hard.",
                   "testing": "Work may feel heavy or slow. Stay patient and organised."},
        "money": {"supportive": "Money matters look good - gains are possible.",
                  "mixed": "Money is stable. Spend wisely.",
                  "testing": "Be careful with money - avoid big spending, lending or risky deals."},
        "health": {"supportive": "Your energy is good. Keep up your routine.",
                   "mixed": "Energy is fine - rest well and eat on time.",
                   "testing": "You may feel tired or stressed. Rest properly and don't overdo things."},
        "mind": {"supportive": "Your mind is sharp - good for studies, talks and messages.",
                 "mixed": "Think before you speak and double-check the details.",
                 "testing": "Misunderstandings happen easily now - read twice, speak gently."},
        "home": {"supportive": "Home and family bring you happiness.",
                 "mixed": "Family life is calm, with a few small things to handle.",
                 "testing": "Small tensions at home are possible - stay calm and listen."},
    },
    "si": {
        "love": {"supportive": "ආදරය හා සමීපකම පහසුවෙන් ගලා යයි. ඔබේ හැඟීම් ප්‍රකාශ කිරීමට හොඳ කාලයක්.",
                 "mixed": "සබඳතා ස්ථාවරයි, නමුත් සැලකිල්ල අවශ්‍යයි. ඉවසීමෙන් හා කරුණාවෙන් කටයුතු කරන්න.",
                 "testing": "ආදර කටයුතු දැන් ටිකක් සෙමින් හෝ අවුල් සහගතව දැනිය හැකියි. අවංකව කතා කරන්න; තීරණ ගැනීමට ඉක්මන් වෙන්න එපා."},
        "career": {"supportive": "රැකියා කටයුතු හොඳින් සිදු වේ - ඔබේ උත්සාහය අනුන්ගේ ඇස ගැටේ.",
                   "mixed": "රැකියාව ස්ථාවරයි. ඕනෑවට වඩා තද නොකර ඔබේ කොටස හොඳින් කරන්න.",
                   "testing": "වැඩ කටයුතු බරක් හෝ ප්‍රමාදයක් ලෙස දැනිය හැකියි. ඉවසීමෙන්, පිළිවෙළට කටයුතු කරන්න."},
        "money": {"supportive": "මුදල් කටයුතු යහපත් - ලාභ ලැබීමේ ඉඩක් තිබේ.",
                  "mixed": "මුදල් තත්ත්වය ස්ථාවරයි. බුද්ධිමත්ව වියදම් කරන්න.",
                  "testing": "මුදල් ගැන පරිස්සම් වන්න - ලොකු වියදම්, ණයට දීම හා අවදානම් ගනුදෙනුවලින් වළකින්න."},
        "health": {"supportive": "ඔබේ ශක්තිය හොඳ මට්ටමක පවතී. ඔබේ දින චර්යාව දිගටම පවත්වා ගන්න.",
                   "mixed": "ශක්තිය සාමාන්‍යයි - හොඳින් විවේක ගන්න, වේලාවට කෑම ගන්න.",
                   "testing": "වෙහෙස හෝ ආතතිය දැනිය හැකියි. හොඳින් විවේක ගන්න; ඕනෑවට වඩා මහන්සි වෙන්න එපා."},
        "mind": {"supportive": "ඔබේ මනස තියුණුයි - ඉගෙනීමට, කතාබහට හා පණිවිඩවලට හොඳයි.",
                 "mixed": "කතා කිරීමට පෙර සිතන්න; විස්තර නැවත පරීක්ෂා කරන්න.",
                 "testing": "වැරදි වැටහීම් පහසුවෙන් ඇති විය හැකියි - දෙවරක් කියවන්න, මෘදුව කතා කරන්න."},
        "home": {"supportive": "නිවස හා පවුල ඔබට සතුට ගෙන දෙයි.",
                 "mixed": "පවුල් ජීවිතය සන්සුන්යි; බලා ගත යුතු පොඩි කාරණා කිහිපයක් තිබේ.",
                 "testing": "නිවසේ පොඩි ආතතීන් ඇති විය හැකියි - සන්සුන්ව සිටින්න, අනුන්ට සවන් දෙන්න."},
    },
}

# Why: one plain sentence per planet, supportive / testing
REASON = {
    "en": {
        "Jupiter": ("Jupiter, the planet of luck, is helping here.", "Jupiter is here, but its help comes slowly."),
        "Saturn": ("Saturn rewards steady effort here.", "Saturn is slowing things down here - patience pays off."),
        "Mars": ("Mars gives you energy and courage here.", "Mars brings heat here - watch your temper."),
        "Venus": ("Venus brings sweetness and harmony.", "Venus makes feelings a little complicated."),
        "Sun": ("The Sun brings you recognition.", "The Sun can stir up ego clashes."),
        "Mercury": ("Mercury helps with clear talks and smart decisions.", "Mercury can cause small misunderstandings."),
        "Rahu": ("Rahu can bring unexpected chances.", "Rahu can bring restlessness or confusion."),
        "Ketu": ("Ketu helps you let go of what is finished.", "Ketu can make you feel distant or uninterested."),
    },
    "si": {
        "Jupiter": ("වාසනාවේ ග්‍රහයා වන ගුරු මෙහිදී ඔබට උදව් කරයි.", "ගුරු මෙහි සිටියත්, ඔහුගේ උදව් ලැබෙන්නේ සෙමිනි."),
        "Saturn": ("නොකඩවා කරන උත්සාහයට සෙනසුරු මෙහිදී ප්‍රතිඵල දෙයි.", "සෙනසුරු මෙහිදී දේවල් ප්‍රමාද කරයි - ඉවසීම අවසානයේ ප්‍රතිඵල දෙයි."),
        "Mars": ("කුජ මෙහිදී ඔබට ශක්තිය හා ධෛර්යය දෙයි.", "කුජ මෙහිදී උණුසුමක් ඇති කරයි - කේන්තිය පාලනය කර ගන්න."),
        "Venus": ("සිකුරු මිහිරියාව හා සමගිය ගෙන එයි.", "සිකුරු නිසා හැඟීම් ටිකක් සංකීර්ණ විය හැකියි."),
        "Sun": ("රවි ඔබට පිළිගැනීමක් ගෙන එයි.", "රවි නිසා මමත්වය හා ගැටුම් මතු විය හැකියි."),
        "Mercury": ("පැහැදිලි කතාබහට හා නුවණැති තීරණවලට බුධ උදව් කරයි.", "බුධ නිසා පොඩි වැරදි වැටහීම් ඇති විය හැකියි."),
        "Rahu": ("රාහු අනපේක්ෂිත අවස්ථා ගෙන එයි.", "රාහු නිසා නොසන්සුන්කම හෝ අවුල් සහගත බවක් ඇති විය හැකියි."),
        "Ketu": ("අවසන් වූ දේ අත්හැරීමට කේතු උදව් කරයි.", "කේතු නිසා උනන්දුව අඩු වීම හෝ ඈත් වූ බවක් දැනිය හැකියි."),
    },
}
RETRO = {
    "en": "{p} is moving backwards right now - a time to review and fix things, not to rush.",
    "si": "{p} දැන් පසුපසට ගමන් කරයි (වක්‍ර) - ඉක්මන් නොවී, පසු බලා දේවල් හදා ගැනීමට කාලයයි.",
}
VENUS_RETRO_LOVE = {
    "en": "The love planet Venus is moving backwards, so old feelings or past connections may come back.",
    "si": "ආදරයේ ග්‍රහයා වන සිකුරු දැන් පසුපසට ගමන් කරයි; එබැවින් පරණ හැඟීම් හෝ පැරණි සබඳතා නැවත මතු විය හැකියි.",
}
MOON_IN = {
    "en": ("Your feelings support this today.", "Your feelings are sensitive here today - listen more than you push."),
    "si": ("අද ඔබේ හැඟීම් මේ කටයුතුවලට උදව් වේ.", "අද මේ ගැන ඔබේ හැඟීම් සංවේදීයි - තද කරනවාට වඩා සවන් දෙන්න."),
}

DO_BY_MOOD = {
    "en": {1: "Take care of yourself - exercise, grooming and rest.", 2: "Plan your budget; enjoy a meal with family.",
           3: "Make that call or send that message.", 4: "Spend time at home and tidy your space.",
           5: "Do something creative or fun; spend time with someone you love.",
           6: "Clear pending work; book that health check.", 7: "Give time to your partner or the people closest to you.",
           8: "Reflect quietly; handle private matters carefully.", 9: "Visit a place of worship, read, or ask an elder for advice.",
           10: "Focus on work and your responsibilities.", 11: "Meet friends; follow up on money owed to you.",
           12: "Go to bed early; keep spending low."},
    "si": {1: "ඔබ ගැනම සැලකිලිමත් වන්න - ව්‍යායාම, පිළිවෙළ හා විවේකය.", 2: "මුදල් සැලසුම් කරන්න; පවුලේ අය සමඟ ආහාර වේලක් රස විඳින්න.",
           3: "ගන්න හිතාගෙන හිටපු ඇමතුම ගන්න, යවන්න ඕන පණිවිඩය යවන්න.", 4: "නිවසේ කාලය ගත කරන්න; ඔබේ ඉඩ පිළිවෙළ කරන්න.",
           5: "නිර්මාණශීලී හෝ විනෝදජනක දෙයක් කරන්න; ඔබ ආදරය කරන කෙනෙකු සමඟ කාලය ගත කරන්න.",
           6: "ඉතිරි වී ඇති වැඩ අවසන් කරන්න; සෞඛ්‍ය පරීක්ෂාවක් කරවා ගන්න.", 7: "ඔබේ සහකරුට හෝ ඔබට සමීපතම අයට කාලය දෙන්න.",
           8: "නිහඬව සිතා බලන්න; පෞද්ගලික කටයුතු පරිස්සමින් කරන්න.", 9: "ආගමික ස්ථානයකට යන්න, යමක් කියවන්න, නැත්නම් වැඩිහිටියෙකුගෙන් උපදෙස් ගන්න.",
           10: "රැකියාව හා ඔබේ වගකීම් කෙරෙහි අවධානය යොමු කරන්න.", 11: "මිතුරන් හමු වන්න; ඔබට ලැබිය යුතු මුදල් ගැන සොයා බලන්න.",
           12: "කලින් නින්දට යන්න; වියදම් අඩුවෙන් තබා ගන්න."},
}

T = {  # small reusable phrases
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
        "dasha_change": "{date}: the {p} sub-period begins - focus shifts to {themes}.",
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
        "dasha_change": "{date}: {p} අන්තර්දශාව ආරම්භ වේ - අවධානය {themes} වෙත යොමු වේ.",
    },
}
EFFECT = {
    "en": {"Jupiter": "luck and growth", "Saturn": "slow, steady pressure", "Mars": "energy and heat",
           "Venus": "love and comfort", "Sun": "attention", "Mercury": "talk and thinking",
           "Rahu": "restless desires", "Ketu": "a sense of letting go"},
    "si": {"Jupiter": "වාසනාව හා දියුණුව", "Saturn": "සෙමින් එන, ස්ථාවර පීඩනයක්", "Mars": "ශක්තිය හා උණුසුම",
           "Venus": "ආදරය හා සුවපහසුව", "Sun": "අවධානය", "Mercury": "කතාබහ හා සිතුවිලි",
           "Rahu": "නොසන්සුන් ආශාවන්", "Ketu": "අත්හැරීමේ හැඟීමක්"},
}
ROLE = {
    "en": {"Jupiter": "luck and growth", "Saturn": "discipline and hard work",
           "Rahu": "desires and ambition", "Ketu": "letting go"},
    "si": {"Jupiter": "වාසනාව හා දියුණුව", "Saturn": "විනය හා වෙහෙස මහන්සිය",
           "Rahu": "ආශාවන් හා අභිලාෂ", "Ketu": "අත්හැරීම"},
}
WORD = {  # how a period feels, for month/week summaries
    "en": {"Excellent": "very good", "Good": "good", "Mixed": "mixed", "Careful": "a little heavy",
           "Quiet & cautious": "slow"},
    "si": {"Excellent": "ඉතා හොඳයි", "Good": "හොඳයි", "Mixed": "මිශ්‍රයි", "Careful": "ටිකක් බරයි",
           "Quiet & cautious": "සෙමින් යයි"},
}


# ----------------------------------------------------------------------------
# Formatting
# ----------------------------------------------------------------------------

def p_(lang, name):
    return PLANET[lang][name]


def time_(jd, tz, lang):
    t = R.local_dt(jd, tz)
    if lang == "si":
        h = t.hour % 12 or 12
        return f"{'පෙ.ව.' if t.hour < 12 else 'ප.ව.'} {h}:{t.minute:02d}"
    return t.strftime("%I:%M %p").lstrip("0")


def date_(jd, tz, lang, weekday=True, year=False):
    t = R.local_dt(jd, tz)
    if lang == "si":
        s = f"{MONTH['si'][t.month - 1]} {t.day}"
        if year:
            s = f"{t.year} {s}"
        return f"{s} ({WEEKDAY['si'][t.weekday()]})" if weekday else s
    s = f"{t.day} {MONTH['en'][t.month - 1][:3]}" + (f" {t.year}" if year else "")
    return f"{WEEKDAY['en'][t.weekday()][:3]} {s}" if weekday else s


def long_date(jd, tz, lang):
    t = R.local_dt(jd, tz)
    if lang == "si":
        return f"{t.year} {MONTH['si'][t.month - 1]} {t.day}, {WEEKDAY['si'][t.weekday()]}"
    return f"{WEEKDAY['en'][t.weekday()]}, {t.day} {MONTH['en'][t.month - 1]} {t.year}"


def join_(items, lang):
    items = list(items)
    if len(items) <= 1:
        return "".join(items)
    return ", ".join(items[:-1]) + f" {T[lang]['and']} " + items[-1]


def iso_jd(iso, tz):
    import datetime as dt
    return R.jd_local(dt.date.fromisoformat(iso), 12, tz)


def lord_themes(natal, lord, lang):
    hs = sorted(set(natal.rules(lord) + [natal.natal_house(lord)]))
    return join_((THEME_SHORT[lang][h] for h in hs), lang)


# ----------------------------------------------------------------------------
# Builders
# ----------------------------------------------------------------------------

def area_simple(a, lang):
    reasons = []
    if a["key"] == "love" and (any(i["planet"] == "Venus" and i["retro"] for i in a["items"])
                               or (a["karaka"] and a["karaka"]["retro"])):
        reasons.append(VENUS_RETRO_LOVE[lang])
    if a["moon_in"] is not None:
        reasons.append(MOON_IN[lang][0 if a["moon_in"] else 1])
    for it in a["items"]:
        if it["planet"] == "Venus" and it["retro"] and a["key"] == "love":
            continue
        good, bad = REASON[lang][it["planet"]]
        reasons.append(good if it["good"] else bad)
        if it["retro"]:
            reasons.append(RETRO[lang].format(p=p_(lang, it["planet"])))
    k = a["karaka"]
    if not a["items"] and k and k["retro"] and not (a["key"] == "love" and k["planet"] == "Venus"):
        reasons.append(RETRO[lang].format(p=p_(lang, k["planet"])))
    seen, uniq = set(), []
    for r in reasons:
        if r not in seen:
            seen.add(r)
            uniq.append(r)
    return {"key": a["key"], "title": AREA_TITLE[lang][a["key"]], "tone": a["tone"],
            "tone_word": TONE[lang][a["tone"]],
            "text": " ".join([AREA_BASE[lang][a["key"]][a["tone"]]] + uniq[:2])}


def chapter_simple(natal, periods, tz, lang):
    if not periods:
        return []
    L = T[lang]
    out = [L["chapter"].format(a=date_(periods["md_start"], tz, lang, False, True),
                               b=date_(periods["md_end"], tz, lang, False, True),
                               p=p_(lang, periods["md"]),
                               themes=lord_themes(natal, periods["md"], lang))]
    b = date_(periods["ad_end"], tz, lang, False, True)
    if periods["ad"] == periods["md"]:
        out.append(L["sub_same"].format(p=p_(lang, periods["md"]), b=b))
    else:
        out.append(L["sub"].format(p=p_(lang, periods["ad"]), b=b,
                                   themes=lord_themes(natal, periods["ad"], lang)))
    return out


def background_simple(raw, lang):
    L = T[lang]
    out = []
    if raw.get("sade_sati"):
        out.append(L["sade_sati"])
    out.append(L["jup_good"] if raw.get("jupiter_good") else L["jup_quiet"])
    return out


def event_simple(e, tz, lang):
    L = T[lang]
    theme = THEME_SHORT[lang][e["house"]]
    p = p_(lang, e["planet"])
    if e["kind"] == "ingress":
        text = L["ing"].format(p=p, theme=theme, effect=EFFECT[lang][e["planet"]])
    elif e["kind"] == "station":
        text = L["retro_ev" if e["direction"] == "retro" else "direct_ev"].format(p=p, theme=theme)
    elif e["kind"] == "lunation":
        text = L["full" if e["lunation"] == "full" else "new"].format(theme=theme)
    else:
        text = L["eclipse_" + e["eclipse"]].format(theme=theme)
    return {"date": date_(e["jd"], tz, lang), "time": time_(e["jd"], tz, lang),
            "kind": e["kind"], "text": text}


def day(d, natal, tz, lang):
    raw = d["raw"]
    L = T[lang]
    mh, ti = raw["moon_house"], raw["tara_i"]
    lines = [MOOD[lang][mh], STAR[lang][ti]]
    if raw["chandrashtama"]:
        lines.append(L["chandrashtama"])

    # best window: the longest good-star stretch inside daylight
    best = None
    for s in d["star_segments"]:
        if R.TARA[s["tara_i"]][2] <= 0:
            continue
        a, b = max(s["from_jd"], raw["sunrise"]), min(s["to_jd"], raw["sunset"])
        if b - a > 1 / 48 and (best is None or b - a > best[1] - best[0]):
            best = (a, b)
    ra, rb = raw["rahu"]
    times = {
        "best": L["range"].format(a=time_(best[0], tz, lang), b=time_(best[1], tz, lang)) if best else L["no_best"],
        "rahu": L["range"].format(a=time_(ra, tz, lang), b=time_(rb, tz, lang)),
        "rahu_note": L["rahu_note"],
        "sunrise": time_(raw["sunrise"], tz, lang), "sunset": time_(raw["sunset"], tz, lang),
    }

    do = [DO_BY_MOOD[lang][mh]]
    avoid = []
    good_star = R.TARA[ti][2] > 0
    if good_star:
        do.append(L["ask_help"] if ti in (7, 8) else L["start_new"])
    else:
        avoid.append(L["avoid_new"])
    if "Venus" in raw["retros"]:
        avoid.append(L["avoid_love"])
    if "Mercury" in raw["retros"]:
        avoid.append(L["avoid_msgs"])
    if raw["chandrashtama"]:
        avoid.append(L["avoid_fight"])
    avoid.append(L["avoid_rahu"].format(a=time_(ra, tz, lang), b=time_(rb, tz, lang)))

    return {
        "date": long_date(raw["date_jd"], tz, lang),
        "as_of": time_(raw["ref_jd"], tz, lang),
        "headline": HEADLINE[lang][d["label"]],
        "short": SHORT[lang][d["label"]],
        "lines": lines,
        "times": times,
        "do": do, "avoid": avoid,
        "areas": [area_simple(a, lang) for a in d["areas"]],
        "background": background_simple(raw, lang),
        "chapter": chapter_simple(natal, raw["periods"], tz, lang),
        "upcoming": [event_simple(e, tz, lang) for e in d["upcoming"]],
    }


def month(m, natal, tz, lang):
    raw = m["raw"]
    L = T[lang]
    label = R.score_label(m["avg"])
    lines = [L["month_focus"].format(theme=THEME[lang][raw["sun_house"]]),
             L["month_overall"].format(word=WORD[lang][label])] + background_simple(raw, lang)
    weeks = []
    for w in m["weeks"]:
        txt = L["week"].format(word=WORD[lang][R.score_label(w["avg"])],
                               best=date_(iso_jd(w["best"], tz), tz, lang),
                               low=date_(iso_jd(w["low"], tz), tz, lang))
        weeks.append({"label": w["label"], "text": txt,
                      "events": [event_simple(e, tz, lang)["text"] for e in w["events"]]})
    return {
        "title": f"{MONTH[lang][m['month'] - 1]} {m['year']}" if lang == "en" else f"{m['year']} {MONTH[lang][m['month'] - 1]}",
        "lines": lines,
        "short_label": WORD[lang][label],
        "days": [{"date": d["date"], "short": SHORT[lang][d["label"]]} for d in m["days"]],
        "best": [{"date": d["date"], "text": date_(iso_jd(d["date"], tz), tz, lang)} for d in m["best"]],
        "careful": [{"date": d["date"], "text": date_(iso_jd(d["date"], tz), tz, lang)} for d in m["careful"]],
        "weeks": weeks,
        "areas": [area_simple(a, lang) for a in m["areas"]],
        "chapter": chapter_simple(natal, raw["periods"], tz, lang),
        "events": [event_simple(e, tz, lang) for e in m["events"]],
        "weekdays": [w[:3] if lang == "en" else w for w in WEEKDAY[lang]],
    }


def year(y, natal, tz, lang):
    raw = y["raw"]
    L = T[lang]
    names = MONTH[lang]
    lines = [L["year_best"].format(best=join_((names[i - 1] for i in raw["best"]), lang),
                                   worst=join_((names[i - 1] for i in raw["worst"]), lang))]
    if raw["sade_sati"]:
        lines.append(L["sade_sati"])
    cards = []
    for mo in y["months"]:
        tones = {k: TONE[lang][mo[k]] for k in ("love", "career", "money")}
        evs = [event_simple(e, tz, lang)["text"] for e in mo["events"]
               if e["kind"] in ("eclipse", "station") or e["planet"] in ("Jupiter", "Saturn", "Venus")][:2]
        cards.append({"month": mo["month"], "name": names[mo["month"] - 1],
                      "short": WORD[lang][R.score_label(mo["avg"])],
                      "text": L["card"].format(theme=THEME[lang][mo["sun_house"]]),
                      "events": evs, "tones": tones, "tone_keys": {k: mo[k] for k in ("love", "career", "money")}})
    journey = []
    for j in raw["journey"]:
        path = L["then"].join(L["journey_seg"].format(theme=THEME_SHORT[lang][s["house"]],
                                                      date=date_(iso_jd(s["from"], tz), tz, lang, False))
                              for s in j["segments"])
        journey.append(L["journey"].format(p=p_(lang, j["planet"]), role=ROLE[lang][j["planet"]], path=path))
    changes = [L["dasha_change"].format(date=date_(c["jd"], tz, lang, False, True), p=p_(lang, c["lord"]),
                                        themes=lord_themes(natal, c["lord"], lang))
               for c in raw["dasha_changes"]]
    return {
        "title": str(y["year"]),
        "lines": lines,
        "months": cards,
        "journey": journey,
        "dasha_changes": changes,
        "chapter": chapter_simple(natal, raw["periods"], tz, lang),
        "areas": [area_simple(a, lang) for a in y["areas"]],
        "events": [event_simple(e, tz, lang) for e in y["events"]],
    }


def natal_simple(n, lang):
    """Profile line: sign names in Sinhala; nakshatra names stay in English
    (their Sinhala spellings are not yet confirmed - see 28-sri-lankan-terminology.md)."""
    if lang != "si":
        return {"lagna": n["lagna"]["sign"], "moon": n["moon_sign"], "star": n["birth_star"]}
    return {"lagna": SIGN_SI[n["lagna"]["sign_idx"]],
            "moon": SIGN_SI[R.SIGN_EN.index(n["moon_sign"])],
            "star": n["birth_star"]}
