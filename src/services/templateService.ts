import { Template } from "../lib/types";

export const fetchTemplates = async (): Promise<Template[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const storedTemplates = localStorage.getItem("annotationTemplates");
      resolve(storedTemplates ? JSON.parse(storedTemplates) : []);
    }, 100);
  });
};

export const saveTemplateToStorage = async (
  template: Template
): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const storedTemplates = localStorage.getItem("annotationTemplates");
      const templates = storedTemplates ? JSON.parse(storedTemplates) : [];
      templates.push(template);
      localStorage.setItem("annotationTemplates", JSON.stringify(templates));
      resolve();
    }, 100);
  });
};

export const deleteTemplateFromStorage = async (
  templateId: string
): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const storedTemplates = localStorage.getItem("annotationTemplates");
      if (storedTemplates) {
        const templates = JSON.parse(storedTemplates);
        const updatedTemplates = templates.filter(
          (t: Template) => t.id !== templateId
        );
        localStorage.setItem(
          "annotationTemplates",
          JSON.stringify(updatedTemplates)
        );
      }
      resolve();
    }, 100);
  });
};
