
import { WorkoutDay } from './types';

export const DEFAULT_PROGRAM: WorkoutDay[] = [
  {
    id: 'routine-a',
    name: 'Antrenman A (Göğüs & Omuz & Biceps)',
    exercises: [
      { id: 'clr-a', name: 'Cable Lateral Raise', targetSets: '2x6-10', targetWeight: '17.5 kg' },
      { id: 'idp', name: 'Incline Dumbbell Press', targetSets: '3x6-10', targetWeight: '40 kg' },
      { id: 'pf', name: 'Pec Fly', targetSets: '2x6-10', targetWeight: '80 kg' },
      { id: 'sohp', name: 'Smith Machine OHP', targetSets: '3x6-10', targetWeight: '27.5 kg' },
      { id: 'lr', name: 'Lateral Raise', targetSets: '2x8-12', targetWeight: '12.5 kg' },
      { id: 'idc', name: 'Incline Dumbbell Curl', targetSets: '2x6-10', targetWeight: '12.5 kg' },
      { id: 'bc', name: 'Barbell Curl', targetSets: '3x6-10', targetWeight: '15 kg' },
    ]
  },
  {
    id: 'routine-b',
    name: 'Antrenman B (Sırt & Triceps)',
    exercises: [
      { id: 'lpd', name: 'Lat Pulldown', targetSets: '2x6-10', targetWeight: '95 kg' },
      { id: 'br', name: 'Barbell Row', targetSets: '3x6-10', targetWeight: '90 kg' },
      { id: 'sr', name: 'Seated Row', targetSets: '2x6-10', targetWeight: '90 kg' },
      { id: 'po', name: 'Pull-over', targetSets: '3x8-12', targetWeight: '50 kg' },
      { id: 'fp', name: 'Facepull', targetSets: '2x8-12', targetWeight: '47.5 kg' },
      { id: 'pd', name: 'Triceps Pushdown', targetSets: '2x6-10', targetWeight: '60 kg' },
      { id: 'jmp', name: 'JM Press', targetSets: '3x6-10', targetWeight: '15 kg' },
    ]
  },
  {
    id: 'sq-day',
    name: 'Bacak (Squat Focus)',
    exercises: [
      { id: 'sq', name: 'Squat', targetSets: '5x5', targetWeight: '60 kg' },
      { id: 'dl', name: 'Deadlift', targetSets: '3x5', targetWeight: '100 kg' },
      { id: 'bp-raw', name: 'Bench Press', targetSets: '5x5', targetWeight: '60 kg' },
      { id: 'ohp-raw', name: 'Overhead Press', targetSets: '5x5', targetWeight: '40 kg' },
    ]
  }
];

// Added MOTIVATION_QUOTES to fix the error in MotivationCard.tsx
export const MOTIVATION_QUOTES = [
  "Bugün yapamadığın her şey yarın için birer tecrübedir.",
  "Disiplin, ne istediğin ile neyi en çok istediğin arasındaki seçimdir.",
  "Pes etmek, sadece bitiş çizgisini görememektir.",
  "Acı geçicidir, gurur ise sonsuz.",
  "Vücudun her şeyi yapabilir, sadece zihnini ikna etmen gerekir.",
  "Sınırlarını zorlamadıkça, gerçek kapasiteni asla öğrenemezsin.",
  "Küçük adımlar, büyük hedeflere giden yolu oluşturur.",
  "En zor antrenman, başlamadığın antrenmandır.",
  "Zayıf yönlerinle yüzleş ve onları güce dönüştür.",
  "Başarı, her gün yapılan küçük eylemlerin toplamıdır."
];
