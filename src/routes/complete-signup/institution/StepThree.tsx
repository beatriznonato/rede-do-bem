import { doc, setDoc } from "firebase/firestore";
import { db } from "../../../firebase/FirebaseConfig";
import { useState } from "react";
import Button from "../../../components/Button/Button";
import Loader from "../../../components/Loader/Loader";
import {
  fieldset,
  formBtnWrapper,
  formElm,
  loaderContainer,
  smallField,
} from "../Step.css";
import FormField from "../../../components/Form/FormField/FormField";
import FormHeader from "../../../components/Form/FormHeader/FormHeader";
import { FormStep } from "../types";
import FormDropdown from "../../../components/Form/FormDropdown/FromDropdown";
import { formatZip } from "../../../utils/formatZip";
import { isValidZip } from "../../../utils/isValidZip";
import { autoFillAddressFromZip } from "../../../utils/autoFillAddressFromZip";

export const states = [
  { label: "AC", value: "AC" },
  { label: "AL", value: "AL" },
  { label: "AP", value: "AP" },
  { label: "AM", value: "AM" },
  { label: "BA", value: "BA" },
  { label: "CE", value: "CE" },
  { label: "DF", value: "DF" },
  { label: "ES", value: "ES" },
  { label: "GO", value: "GO" },
  { label: "MA", value: "MA" },
  { label: "MT", value: "MT" },
  { label: "MS", value: "MS" },
  { label: "MG", value: "MG" },
  { label: "PA", value: "PA" },
  { label: "PB", value: "PB" },
  { label: "PR", value: "PR" },
  { label: "PE", value: "PE" },
  { label: "PI", value: "PI" },
  { label: "RJ", value: "RJ" },
  { label: "RN", value: "RN" },
  { label: "RS", value: "RS" },
  { label: "RO", value: "RO" },
  { label: "RR", value: "RR" },
  { label: "SC", value: "SC" },
  { label: "SP", value: "SP" },
  { label: "SE", value: "SE" },
  { label: "TO", value: "TO" },
];

export const StepThree = ({
  uid,
  onNext,
  onBack,
  form,
  onFormChange,
}: FormStep) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [zipError, setZipError] = useState<string | undefined>(undefined);

  if (!("cnpj" in form)) return null;

  const handleChange = async (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name } = e.target;
    let { value } = e.target;

    if (name === "address.zip") {
      value = formatZip(value);
      onFormChange(name, value);

      await autoFillAddressFromZip(value, onFormChange, setZipError, undefined);

      return;
    }

    onFormChange(name, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanedZip = form.address.zip.replace(/\D/g, "");
    if (!isValidZip(cleanedZip) || zipError) {
      setZipError("Informe um CEP válido antes de continuar.");
      return;
    }

    setIsSubmitting(true);

    try {
      await setDoc(doc(db, "users", uid), { ...form }, { merge: true });
      onNext();
    } catch (error) {
      console.error("Erro ao salvar dados:", error);
    }

    setIsSubmitting(false);
  };

  return (
    <form className={formElm} onSubmit={handleSubmit} autoComplete="off">
      <FormHeader headline="Onde fica sua instituição?" />

      <FormField
        label="CEP"
        name="address.zip"
        value={form.address.zip}
        onChange={handleChange}
        error={zipError}
        required
        autoComplete="off"
      />

      <fieldset className={fieldset}>
        <FormField
          label="Logradouro"
          name="address.street"
          value={form.address.street}
          onChange={handleChange}
          required
          autoComplete="off"
        />
        <FormField
          label="Número"
          name="address.number"
          type="number"
          value={form.address.number}
          onChange={handleChange}
          required
          className={smallField}
          autoComplete="off"
        />
      </fieldset>

      <FormField
        label="Complemento"
        name="address.additionalAddressInfo"
        value={form.address.additionalAddressInfo}
        onChange={handleChange}
        required={false}
        autoComplete="off"
      />

      <FormField
        label="Bairro"
        name="address.district"
        value={form.address.district}
        onChange={handleChange}
        required
        autoComplete="off"
      />

      <fieldset className={fieldset}>
        <FormField
          label="Cidade"
          name="address.city"
          value={form.address.city}
          onChange={handleChange}
          required
          autoComplete="off"
        />
        <FormDropdown
          label="Estado"
          name="address.state"
          value={form.address.state}
          onChange={handleChange}
          placeholder="UF"
          required
          className={smallField}
          options={states}
        />
      </fieldset>

      <div className={formBtnWrapper}>
        <Button
          type="button"
          variant="transparent"
          icon="arrowLeft"
          onClick={onBack}
        >
          Voltar
        </Button>
        {isSubmitting ? (
          <div className={loaderContainer}>
            <Loader />
          </div>
        ) : (
          <Button type="submit">Concluir</Button>
        )}
      </div>
    </form>
  );
};

export default StepThree;
