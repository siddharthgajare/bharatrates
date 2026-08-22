export type StateInfo = {
  name: string;
  code: string;
  capital: string;
  cities: string[];
  region: 'north' | 'south' | 'east' | 'west' | 'central' | 'northeast';
};

export const STATES: StateInfo[] = [
  { name: 'Andhra Pradesh', code: 'AP', capital: 'Amaravati', region: 'south', cities: ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Tirupati'] },
  { name: 'Arunachal Pradesh', code: 'AR', capital: 'Itanagar', region: 'northeast', cities: ['Itanagar', 'Naharlagun', 'Tawang'] },
  { name: 'Assam', code: 'AS', capital: 'Dispur', region: 'northeast', cities: ['Guwahati', 'Dibrugarh', 'Silchar', 'Jorhat'] },
  { name: 'Bihar', code: 'BR', capital: 'Patna', region: 'east', cities: ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur'] },
  { name: 'Chhattisgarh', code: 'CG', capital: 'Raipur', region: 'central', cities: ['Raipur', 'Bhilai', 'Bilaspur', 'Korba'] },
  { name: 'Goa', code: 'GA', capital: 'Panaji', region: 'west', cities: ['Panaji', 'Margao', 'Vasco da Gama'] },
  { name: 'Gujarat', code: 'GJ', capital: 'Gandhinagar', region: 'west', cities: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot'] },
  { name: 'Haryana', code: 'HR', capital: 'Chandigarh', region: 'north', cities: ['Gurugram', 'Faridabad', 'Panipat', 'Ambala'] },
  { name: 'Himachal Pradesh', code: 'HP', capital: 'Shimla', region: 'north', cities: ['Shimla', 'Manali', 'Solan', 'Dharamshala'] },
  { name: 'Jharkhand', code: 'JH', capital: 'Ranchi', region: 'east', cities: ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro'] },
  { name: 'Karnataka', code: 'KA', capital: 'Bengaluru', region: 'south', cities: ['Bengaluru', 'Mysuru', 'Mangaluru', 'Hubli'] },
  { name: 'Kerala', code: 'KL', capital: 'Thiruvananthapuram', region: 'south', cities: ['Kochi', 'Kozhikode', 'Thiruvananthapuram', 'Thrissur'] },
  { name: 'Madhya Pradesh', code: 'MP', capital: 'Bhopal', region: 'central', cities: ['Bhopal', 'Indore', 'Jabalpur', 'Gwalior'] },
  { name: 'Maharashtra', code: 'MH', capital: 'Mumbai', region: 'west', cities: ['Mumbai', 'Pune', 'Nagpur', 'Nashik'] },
  { name: 'Manipur', code: 'MN', capital: 'Imphal', region: 'northeast', cities: ['Imphal', 'Churachandpur'] },
  { name: 'Meghalaya', code: 'ML', capital: 'Shillong', region: 'northeast', cities: ['Shillong', 'Tura'] },
  { name: 'Mizoram', code: 'MZ', capital: 'Aizawl', region: 'northeast', cities: ['Aizawl', 'Lunglei'] },
  { name: 'Nagaland', code: 'NL', capital: 'Kohima', region: 'northeast', cities: ['Kohima', 'Dimapur'] },
  { name: 'Odisha', code: 'OD', capital: 'Bhubaneswar', region: 'east', cities: ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Brahmapur'] },
  { name: 'Punjab', code: 'PB', capital: 'Chandigarh', region: 'north', cities: ['Ludhiana', 'Amritsar', 'Jalandhar', 'Mohali'] },
  { name: 'Rajasthan', code: 'RJ', capital: 'Jaipur', region: 'north', cities: ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota'] },
  { name: 'Sikkim', code: 'SK', capital: 'Gangtok', region: 'northeast', cities: ['Gangtok', 'Namchi'] },
  { name: 'Tamil Nadu', code: 'TN', capital: 'Chennai', region: 'south', cities: ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli'] },
  { name: 'Telangana', code: 'TS', capital: 'Hyderabad', region: 'south', cities: ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar'] },
  { name: 'Tripura', code: 'TR', capital: 'Agartala', region: 'northeast', cities: ['Agartala', 'Dharmanagar'] },
  { name: 'Uttar Pradesh', code: 'UP', capital: 'Lucknow', region: 'north', cities: ['Lucknow', 'Kanpur', 'Agra', 'Varanasi'] },
  { name: 'Uttarakhand', code: 'UK', capital: 'Dehradun', region: 'north', cities: ['Dehradun', 'Haridwar', 'Nainital', 'Haldwani'] },
  { name: 'West Bengal', code: 'WB', capital: 'Kolkata', region: 'east', cities: ['Kolkata', 'Howrah', 'Durgapur', 'Siliguri'] },
];

export const STATE_BY_NAME = Object.fromEntries(STATES.map((s) => [s.name, s]));

export function normalizeState(input: string): StateInfo | null {
  const lower = input.toLowerCase().replace(/-/g, ' ').trim();
  return (
    STATES.find((s) => s.name.toLowerCase() === lower) ||
    STATES.find((s) => s.code.toLowerCase() === lower) ||
    null
  );
}
