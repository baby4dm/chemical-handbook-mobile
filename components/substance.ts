export interface Substance {
    oonNumber: number;
    name: string;
    dangerousNumber: string;
    formula: string;
    description: string;
    aggregationState: string;
    densityAir: string;
    densityWater: string;
    solubility: string;
    generalDanger: string;
    waterDanger: string;
    imdg: string;
    haz: string;
    container: string;
    respirationRecommendation: string;
    skinDefenseRecommendation: string;
    molecularWeight: number;
    flammabilityClass: string;
    temperatureProperties: {
      boilingPoint: number;
      freezePoint: number;
      meltingPoint: number;
      flashPoint: number;
    };
    healthInvolve: {
      lethal: number;
      limitConcentration: number;
      involveWays: string;
      symptoms: string;
      organImpacts: string;
    };
    firstAid: {
      eyes: string;
      skin: string;
      inhalation: string;
      swallowing: string;
    };
    dangerSquare: {
      health: number;
      fire: number;
      chemistry: number;
      other: number;
    };
  }



  // substance.ts
export enum AggregationState {
    GASEOUS = "Газоподібний",
    LIQUID = "Рідкий",
    SOLID = "Твердий",
    TRANSITIONAL = "Перехідний"
  }
  
  export enum DensityAir {
    LIGHTER = "Легша за повітря",
    SAME = "Однакова з повітрям",
    HEAVIER = "Важча за повітря"
  }
  
  export enum DensityWater {
    LIGHTER = "Легша за воду",
    SAME = "Однакова з водою",
    HEAVIER = "Важча за воду"
  }
  
  export enum GeneralDanger {
    FLAMMABLE = "Горюча",
    EXPLOSIVE = "Вибухонебезпечна",
    RADIOACTIVE = "Радіоактивна"
  }
  
  export enum Solubility {
    SOLUBLE = "Водорозчинна",
    LIMITED_SOLUBLE = "Обмежено-розчинна",
    NOT_SOLUBLE = "Нерозчинна"
  }
  
  export enum WaterDanger {
    NOT_RECOMMENDED = "Обережно з водою",
    FORBIDDEN = "Заборонено воду",
    ABSENT = "Відсутня"
  }
  
  export enum FlammabilityClass {
    FIRST = "1",
    SECOND = "2",
    THIRD = "3",
    FOURTH = "4"
  }
  
  export interface Filters {
    dangerousNumber: string;
    aggregationState: AggregationState | '';
    densityWater: DensityWater | '';
    densityAir: DensityAir | '';
    solubility: Solubility | '';
    generalDanger: GeneralDanger | '';
    waterDanger: WaterDanger | '';
  }