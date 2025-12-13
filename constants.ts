
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
