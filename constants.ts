
import { WorkoutDay } from './types';

export const WEEKLY_PROGRAM: WorkoutDay[] = [
  {
    id: 'mon',
    name: 'Pazartesi',
    exercises: [
      { id: 'dl', name: 'Deadlift', targetSets: '5x5-8', targetWeight: '75 kg', lastLog: '8-7-7-8-10' },
      { id: 'sr', name: 'Seated Row', targetSets: '4x8-12', targetWeight: '95 kg', lastLog: '12-7-6-5' },
      { id: 'idp', name: 'Incline Dumbell Press', targetSets: '4x6-10', targetWeight: '27.5 kg', lastLog: '8-8-8-8' },
      { id: 'pu', name: 'Push Up', targetSets: '3x15', targetWeight: 'Vücut', lastLog: '14' },
      { id: 'clr1', name: 'Cable Lateral Raise', targetSets: '4x12-15', targetWeight: '10 kg', lastLog: '10-' },
      { id: 'cc', name: 'Cable Curl', targetSets: '3x8-12', targetWeight: '35 kg', lastLog: '10-10-10' },
    ]
  },
  {
    id: 'wed',
    name: 'Çarşamba',
    exercises: [
      { id: 'sq', name: 'Squat', targetSets: '5x5-8', targetWeight: '20 kg', lastLog: '8-8-8-8-8' },
      { id: 'lp', name: 'Leg Press', targetSets: '3x8-12', targetWeight: '110 kg', lastLog: '8-8-' },
      { id: 'lc', name: 'Leg Curl', targetSets: '3x12-15', targetWeight: '20 kg', lastLog: '12-' },
      { id: 'ddl', name: 'Dumbell Deadlift', targetSets: '2x12-15', targetWeight: '40 kg', lastLog: '-' },
      { id: 'cp', name: 'Calf Press', targetSets: '3x15-20', targetWeight: '40 kg', lastLog: '-' },
    ]
  },
  {
    id: 'thu',
    name: 'Perşembe',
    exercises: [
      { id: 'bp', name: 'Bench Press', targetSets: '5x5-8', targetWeight: '27.5 kg', lastLog: '8-8-8-8-12' },
      { id: 'ip', name: 'Incline Press', targetSets: '3x8', targetWeight: '22.5-25 kg', lastLog: '8-8-8-8' },
      { id: 'lpd', name: 'Lat Pulldown', targetSets: '4x8-12', targetWeight: '65 kg', lastLog: '10-8-8-8' },
      { id: 'br', name: 'Barbell Row', targetSets: '3x12-15', targetWeight: '25 kg', lastLog: '8-8-8-8' },
      { id: 'hc', name: 'Hammer Curl', targetSets: '4x12-15', targetWeight: '15 kg', lastLog: '10-10-' },
      { id: 'clr2', name: 'Cable Lateral Raise', targetSets: '3x12-15', targetWeight: '10 kg', lastLog: '17-15' },
    ]
  },
  {
    id: 'sat',
    name: 'Cumartesi',
    exercises: [
      { id: 'ohp', name: 'OHP', targetSets: '5x5-8', targetWeight: '22.5 kg', lastLog: '12-12-10-8-12' },
      { id: 'rd', name: 'Rear Delt', targetSets: '3x15-25', targetWeight: '30 kg', lastLog: '15-15-15' },
      { id: 'bf', name: 'Barfiks', targetSets: '4x5-10', targetWeight: 'Vücut', lastLog: '4-6-7-4' },
      { id: 'dp', name: 'Dips', targetSets: '3x8-12', targetWeight: '85 kg', lastLog: '12-12-8' },
      { id: 'pd', name: 'Pushdown', targetSets: '3x8-12', targetWeight: '75 kg', lastLog: '12-12-' },
      { id: 'kb', name: 'Kickback', targetSets: '2x12-15', targetWeight: '10 kg', lastLog: '15-12' },
    ]
  }
];

export const MOTIVATION_QUOTES = [
  "Antrenman yapmadığın gün, kaybettiğin gündür.",
  "Ter, yağların ağlamasıdır.",
  "Yarın değil, şimdi.",
  "Bırakmak istediğinde, neden başladığını hatırla.",
  "Acı geçicidir, başarı kalıcıdır.",
  "Vücudun yapabilir, ikna etmen gereken tek şey zihnin.",
  "Bahane üretme, kas üret.",
  "Bugün hissettiğin acı, yarın hissedeceğin güçtür.",
  "Disiplin, istediğin şey ile şu anki durumun arasındaki köprüdür.",
  "Limitlerin sadece zihninde.",
  "Kolay olmayacak, buna değecek.",
  "Şampiyonlar salonda değil, içlerindeki tutkuyla doğar.",
  "Yavaş ilerlemen, durmandan iyidir.",
  "Kendinin en iyi versiyonu olmak için çalış.",
  "Motivasyon seni başlatır, alışkanlık devam ettirir.",
  "Hayallerin için terle.",
  "Yorgun olduğunda değil, bittiğinde dur.",
  "Sadece yap.",
  "Zorluklar seni güçlendirmek içindir.",
  "Her tekrar seni hedefine yaklaştırır.",
  "Aynaya baktığında gurur duyacağın birini inşa et.",
  "Başarı, her gün tekrarlanan küçük çabaların toplamıdır.",
  "Sınırlarını zorlamazsan, sınırlarının ne olduğunu asla bilemezsin.",
  "Güç, konfor alanında büyümez.",
  "Odaklan, çalış, başar.",
  "Yataktan kalk ve hayallerini kovala.",
  "En kötü antrenman, yapılmamış antrenmandır.",
  "Sabır acıdır, meyvesi tatlıdır.",
  "İnanç görünmeyeni görür, inanılmayana inanır ve imkansızı başarır.",
  "Bugün kendine bir iyilik yap ve pes etme."
];

export interface AnatomyInfo {
  variables: {
    gender: string;
    view_angle: string;
    target_muscle_group: string;
    highlight_color: string;
  }
}

export const EXERCISE_ANATOMY: Record<string, AnatomyInfo> = {
  // Pazartesi
  'dl': { 
    variables: { 
      gender: "Male", 
      view_angle: "Rear view", 
      target_muscle_group: "Posterior Chain (Hamstrings, Gluteus Maximus, Erector Spinae)", 
      highlight_color: "glowing Red" 
    } 
  },
  'sr': { 
    variables: { 
      gender: "Male", 
      view_angle: "Rear view", 
      target_muscle_group: "Latissimus Dorsi and Rhomboids", 
      highlight_color: "glowing Cyan Blue" 
    } 
  },
  'idp': { 
    variables: { 
      gender: "Male", 
      view_angle: "Front view", 
      target_muscle_group: "Upper Pectoralis Major (Clavicular Head)", 
      highlight_color: "glowing Cyan Blue" 
    } 
  },
  'pu': { 
    variables: { 
      gender: "Male", 
      view_angle: "Front view", 
      target_muscle_group: "Pectoralis Major and Triceps Brachii", 
      highlight_color: "glowing Cyan Blue" 
    } 
  },
  'clr1': { 
    variables: { 
      gender: "Male", 
      view_angle: "Front view", 
      target_muscle_group: "Lateral Deltoid", 
      highlight_color: "glowing Orange" 
    } 
  },
  'cc': { 
    variables: { 
      gender: "Male", 
      view_angle: "Front view", 
      target_muscle_group: "Biceps Brachii", 
      highlight_color: "glowing Pink" 
    } 
  },
  
  // Çarşamba
  'sq': { 
    variables: { 
      gender: "Male", 
      view_angle: "Front view", 
      target_muscle_group: "Quadriceps Femoris and Gluteus Maximus", 
      highlight_color: "glowing Red" 
    } 
  },
  'lp': { 
    variables: { 
      gender: "Male", 
      view_angle: "Front view", 
      target_muscle_group: "Quadriceps Femoris", 
      highlight_color: "glowing Red" 
    } 
  },
  'lc': { 
    variables: { 
      gender: "Male", 
      view_angle: "Rear view", 
      target_muscle_group: "Hamstrings (Biceps Femoris)", 
      highlight_color: "glowing Orange" 
    } 
  },
  'ddl': { 
    variables: { 
      gender: "Male", 
      view_angle: "Rear view", 
      target_muscle_group: "Hamstrings and Gluteus Maximus", 
      highlight_color: "glowing Red" 
    } 
  },
  'cp': { 
    variables: { 
      gender: "Male", 
      view_angle: "Rear view", 
      target_muscle_group: "Gastrocnemius (Calves)", 
      highlight_color: "glowing Yellow" 
    } 
  },

  // Perşembe
  'bp': { 
    variables: { 
      gender: "Male", 
      view_angle: "Front view", 
      target_muscle_group: "Pectoralis Major (Chest)", 
      highlight_color: "glowing Cyan Blue" 
    } 
  },
  'ip': { 
    variables: { 
      gender: "Male", 
      view_angle: "Front view", 
      target_muscle_group: "Upper Pectoralis Major", 
      highlight_color: "glowing Cyan Blue" 
    } 
  },
  'lpd': { 
    variables: { 
      gender: "Male", 
      view_angle: "Rear view", 
      target_muscle_group: "Latissimus Dorsi", 
      highlight_color: "glowing Cyan Blue" 
    } 
  },
  'br': { 
    variables: { 
      gender: "Male", 
      view_angle: "Rear view", 
      target_muscle_group: "Middle Back (Rhomboids, Trapezius)", 
      highlight_color: "glowing Cyan Blue" 
    } 
  },
  'hc': { 
    variables: { 
      gender: "Male", 
      view_angle: "Front view", 
      target_muscle_group: "Brachialis and Forearms", 
      highlight_color: "glowing Pink" 
    } 
  },
  'clr2': { 
    variables: { 
      gender: "Male", 
      view_angle: "Front view", 
      target_muscle_group: "Lateral Deltoid", 
      highlight_color: "glowing Orange" 
    } 
  },

  // Cumartesi
  'ohp': { 
    variables: { 
      gender: "Male", 
      view_angle: "Front view", 
      target_muscle_group: "Anterior and Lateral Deltoids", 
      highlight_color: "glowing Orange" 
    } 
  },
  'rd': { 
    variables: { 
      gender: "Male", 
      view_angle: "Rear view", 
      target_muscle_group: "Posterior Deltoids", 
      highlight_color: "glowing Orange" 
    } 
  },
  'bf': { 
    variables: { 
      gender: "Male", 
      view_angle: "Rear view", 
      target_muscle_group: "Latissimus Dorsi", 
      highlight_color: "glowing Cyan Blue" 
    } 
  },
  'dp': { 
    variables: { 
      gender: "Male", 
      view_angle: "Side view", 
      target_muscle_group: "Triceps Brachii and Lower Chest", 
      highlight_color: "glowing Purple" 
    } 
  },
  'pd': { 
    variables: { 
      gender: "Male", 
      view_angle: "Rear view", 
      target_muscle_group: "Triceps Brachii", 
      highlight_color: "glowing Purple" 
    } 
  },
  'kb': { 
    variables: { 
      gender: "Male", 
      view_angle: "Side view", 
      target_muscle_group: "Triceps Brachii", 
      highlight_color: "glowing Purple" 
    } 
  },
};
