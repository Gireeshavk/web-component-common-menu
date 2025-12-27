export interface MenuItem {
  sWAFunctionalityID: number;
  functionalityName: string;
  isModule: boolean;
  functionalityModuleCode: string;
  parentSWAFunctionalityID: number;
  iconClass: string;
  description: string;
  isIndependentMenu: boolean;
  isEnabled: boolean;
  orgAppID: number;
  sequenceID: number;
  url?: string;
  languageID: number;
  color: string | null;
  domainURL: string | null;
}