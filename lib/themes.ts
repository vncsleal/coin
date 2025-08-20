export interface Theme {
  name: string
  label: string
  description: string
  className: string
}

export const availableThemes: Theme[] = [
  {
    name: "light",
    label: "Claro",
    description: "Tema claro padrão",
    className: "light"
  },
  {
    name: "dark", 
    label: "Escuro",
    description: "Tema escuro padrão",
    className: "dark"
  },
  {
    name: "cutia",
    label: "Cutia",
    description: "Tema Cutia com tons quentes e aconchegantes",
    className: "cutia"
  },
  {
    name: "gothic-cutia",
    label: "Cutia Gótica",
    description: "Cutia em modo escuro com tons quentes e misteriosos",
    className: "gothic-cutia"
  },
  {
    name: "capivara",
    label: "Capivara",
    description: "Tema vibrante com laranja brilhante e energia tropical",
    className: "capivara"
  },
  {
    name: "capivara-sunset",
    label: "Capivara Sunset",
    description: "Capivara em modo escuro com tons de laranja do pôr do sol",
    className: "capivara-sunset"
  }
]

export function getThemeByName(name: string): Theme | undefined {
  return availableThemes.find(theme => theme.name === name)
}

export function getDefaultTheme(): Theme {
  return availableThemes[0] // light theme
}
