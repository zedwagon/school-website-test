export const CIVIL_STATUS_OPTIONS = [
  { value: "married", label: "Married" },
  { value: "not_married", label: "Not Married" },
  { value: "solo_parent", label: "Solo Parent" },
  { value: "widowed_widower", label: "Widowed/Widower" },
  { value: "single", label: "Single" },
] as const;

export const OCCUPATION_TYPE_OPTIONS = [
  { value: "government", label: "Government Employee" },
  { value: "private", label: "Private Employee" },
  { value: "self_employed", label: "Self-Employed" },
  { value: "housewife", label: "Housewife" },
  { value: "retired", label: "Retired" },
  { value: "ofw", label: "OFW" },
] as const;

export const INCOME_BRACKET_OPTIONS = [
  { value: "below_5k", label: "below 5,000" },
  { value: "5k_10k", label: "5,001-10,000" },
  { value: "10k_20k", label: "10,001-20,000" },
  { value: "20k_30k", label: "20,001-30,000" },
  { value: "30k_40k", label: "30,001-40,000" },
  { value: "40k_50k", label: "40,001-50,000" },
  { value: "50k_above", label: "50,001 and above" },
] as const;

export const EDUCATIONAL_ATTAINMENT_OPTIONS = [
  { value: "elementary", label: "Elementary Graduate" },
  { value: "high_school", label: "High School Graduate" },
  { value: "vocational", label: "Vocational Course" },
  { value: "college", label: "College Graduate" },
  { value: "post_graduate", label: "Post Graduate / Master's / Doctorate" },
  { value: "none", label: "None / Other" },
] as const;

export interface SpecialNeedItem {
  id: string;
  label: string;
}

export interface SpecialNeedCategory {
  id: string;
  items: SpecialNeedItem[];
  title: string;
}

export const SPECIAL_NEEDS_CATEGORIES: SpecialNeedCategory[] = [
  {
    id: "medical_profile",
    title: "Student’s Medical Profile",
    items: [
      { id: "allergy", label: "allergy/ies" },
      { id: "arthritis", label: "arthritis" },
      { id: "asthma", label: "asthma" },
      { id: "epilepsy", label: "epilepsy" },
      { id: "cancer", label: "cancer" },
      { id: "deaf", label: "deaf" },
      { id: "diabetes", label: "diabetes" },
      { id: "obesity", label: "obesity" },
      { id: "heart_disease", label: "heart disease" },
      { id: "migraine", label: "migraine" },
      { id: "osteoporosis", label: "osteoporosis" },
      { id: "pneumonia", label: "pneumonia" },
      { id: "uti", label: "UTI" },
      { id: "astigmatism", label: "astigmatism" },
      { id: "others_medical", label: "others" },
    ],
  },
  {
    id: "learning_disabilities",
    title: "Learning Disabilities",
    items: [
      { id: "pronouncing", label: "Problems pronouncing words" },
      { id: "finding_word", label: "Trouble finding the right word" },
      { id: "rhyming", label: "Difficulty rhyming" },
      {
        id: "alphabet_colors",
        label:
          "Trouble learning the alphabet, numbers, colors, shapes, days of the week",
      },
      {
        id: "directions_routines",
        label: "Difficulty following directions or learning routines",
      },
      {
        id: "controlling_crayons",
        label:
          "Difficulty controlling crayons, pencils, and scissors, or coloring within the lines",
      },
      {
        id: "buttons_zippers",
        label: "Trouble with buttons, zippers, snaps, learning to tie shoes",
      },
      {
        id: "letters_sounds",
        label: "Trouble learning the connection between letters and sounds",
      },
      { id: "unable_blend", label: "Unable to blend sounds to make words" },
      { id: "confuses_words", label: "Confuses basic words when reading" },
      { id: "learns_slowly", label: "Learns new skills slowly" },
      {
        id: "misspells",
        label: "Consistently misspells words and makes frequent errors",
      },
      { id: "math_concepts", label: "Trouble learning basic math concepts" },
      {
        id: "telling_time",
        label: "Difficulty telling time and remembering sequences",
      },
      {
        id: "reading_math_skills",
        label: "Difficulty with reading comprehension or math skills",
      },
      {
        id: "open_ended_questions",
        label: "Trouble with open-ended test questions and word problems",
      },
      {
        id: "dislikes_reading",
        label: "Dislikes reading and writing; avoids reading aloud",
      },
      { id: "handwriting", label: "Poor handwriting" },
      {
        id: "organizational_skills",
        label:
          "Poor organizational skills (bedroom, homework, desk is messy and disorganized)",
      },
      {
        id: "discussions_expression",
        label:
          "Trouble following classroom discussions and expressing thoughts aloud",
      },
      {
        id: "spells_differently",
        label: "Spells the same word differently in a single document",
      },
      { id: "others_learning", label: "others, please specify" },
    ],
  },
  {
    id: "developmental_delays",
    title: "Developmental Delay",
    items: [
      { id: "add", label: "Attention Deficit Disorder (ADD)" },
      { id: "hd", label: "Hyperactive Disorder (HD)" },
      { id: "combined_adhd", label: "Combined ADHD" },
      { id: "asd", label: "Autism Spectrum Disorder" },
      { id: "speech_delay", label: "Speech Delay" },
      { id: "others_delay", label: "others, please specify" },
    ],
  },
  {
    id: "self_control_problems",
    title: "Self-control Problem",
    items: [
      { id: "odd", label: "Oppositional Defiant Disorder" },
      { id: "conduct_disorder", label: "Conduct Disorder" },
      { id: "impulse_control", label: "impulse control" },
      { id: "others_control", label: "others, please specify" },
    ],
  },
  {
    id: "behavioral_needs",
    title: "Behavioral Needs",
    items: [
      { id: "bullying", label: "bullying" },
      { id: "self_harm", label: "self-harm" },
      { id: "others_behavioral", label: "others, please specify" },
    ],
  },
  {
    id: "consulted_specialists",
    title: "Have you consulted a",
    items: [
      { id: "pediatrician", label: "Development Pediatrician" },
      { id: "psychologist", label: "Development Psychologist" },
      { id: "behavior_therapist", label: "Behavior Therapist" },
      { id: "occupational_therapist", label: "Occupational Therapist" },
      { id: "speech_pathologist", label: "Speech Pathologist" },
      { id: "psychiatrist", label: "Psychiatrist" },
      { id: "counseling_specialist", label: "Counseling Specialist" },
      { id: "others_specialist", label: "Others" },
    ],
  },
];
