import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { validator } from "../../../utils/validator";
import TextField from "../../common/form/textField";
import api from "../../../api";
import SelectField from "../../common/form/selectField";
import RadioField from "../../common/form/radioField";
import MultiSelectField from "../../common/form/multiSelectField";
// скопировала импорты из формы регистрации, удалила чекбокс и добавила useHistory, useParams

const EditUserPage = () => {
    // прописала для всего стейты и добавила состояние загрузки страницы
    const [pageIsLoading, setPageIsLoading] = useState(false);
    const { userId } = useParams();
    const history = useHistory();
    const [data, setData] = useState({
        name: "",
        email: "",
        profession: "",
        sex: "male",
        qualities: []
    });

    // скопировала состояния и получение профессий и качеств юзера из registerForm
    const [qualities, setQualities] = useState([]);
    const [professions, setProfession] = useState([]);
    const [errors, setErrors] = useState({});
    const getProfessionById = (id) => {
        for (const prof of professions) {
            if (prof.value === id) {
                return { _id: prof.value, name: prof.label };
            }
        }
    };
    const getQualities = (elements) => {
        const qualitiesArray = [];
        for (const elem of elements) {
            for (const quality in qualities) {
                if (elem.value === qualities[quality].value) {
                    qualitiesArray.push({
                        _id: qualities[quality].value,
                        name: qualities[quality].label,
                        color: qualities[quality].color
                    });
                }
            }
        }
        return qualitiesArray;
    };
    // ____________________________________________________________________

    useEffect(() => {
        // загружаем страницу
        setPageIsLoading(true);
        // запрашиваем нашего пользователя
        api.users.getById(userId).then(({ profession, qualities, ...data }) =>
            setData((prevState) => ({
                ...prevState,
                ...data,
                profession: profession._id,
                qualities: qualities.map((quality) => ({
                    label: quality.name,
                    value: quality._id
                }))
            }))
        );
        // скопировала из registerForm
        api.professions.fetchAll().then((data) => {
            const professionsList = Object.keys(data).map((professionName) => ({
                label: data[professionName].name,
                value: data[professionName]._id
            }));
            setProfession(professionsList);
        });
        api.qualities.fetchAll().then((data) => {
            const qualitiesList = Object.keys(data).map((optionName) => ({
                value: data[optionName]._id,
                label: data[optionName].name,
                color: data[optionName].color
            }));
            setQualities(qualitiesList);
        });
    }, []);

    // после изменения данных (каждый раз) убираем загрузку страницы
    useEffect(() => {
        if (data._id) setPageIsLoading(false);
    }, [data]);

    // скопировала из registerForm
    const handleChange = (target) => {
        setData((prevState) => ({
            ...prevState,
            [target.name]: target.value
        }));
    };

    // сделала по типу registerForm
    const validatorConfig = {
        email: {
            isRequired: {
                message: "Электронная почта обязательна для заполнения"
            },
            isEmail: {
                message: "Email введен некорректно"
            }
        },
        name: {
            isRequired: {
                message: "Введите ваше имя"
            }
        }
    };

    // скопировала из registerForm
    useEffect(() => {
        validate();
    }, [data]);
    const validate = () => {
        const errors = validator(data, validatorConfig);
        setErrors(errors);
        return Object.keys(errors).length === 0;
    };
    const isValid = Object.keys(errors).length === 0;

    const handleSubmit = (e) => {
        e.preventDefault();
        const isValid = validate();
        if (!isValid) return;
        const { profession, qualities } = data;
        // добавила асинхронное обновление данных
        api.users
            .update(userId, {
                ...data,
                profession: getProfessionById(profession),
                qualities: getQualities(qualities)
            })
            // и переадресовала пользователя на обновленного юзера
            .then((data) => history.push(`/users/${data._id}`));
        console.log({
            ...data,
            profession: getProfessionById(profession),
            qualities: getQualities(qualities)
        });
    };

    return (
        // скопировала из registerForm и немного подкорректировала
        <div className="container mt-5">
            <div className="row">
                <div className="col-md-6 offset-md-3 shadow p-4">
                    {!pageIsLoading && Object.keys(professions) ? (
                        <form onSubmit={handleSubmit}>
                            <TextField
                                label="Имя"
                                name="name"
                                value={data.name}
                                onChange={handleChange}
                                error={errors.name}
                            />
                            <TextField
                                label="Электронная почта"
                                name="email"
                                value={data.email}
                                onChange={handleChange}
                                error={errors.email}
                            />
                            <SelectField
                                label="Выбери свою профессию"
                                defaultOption="Choose..."
                                options={professions}
                                name="profession"
                                onChange={handleChange}
                                value={data.profession}
                                error={errors.profession}
                            />
                            <RadioField
                                options={[
                                    { name: "Male", value: "male" },
                                    { name: "Female", value: "female" },
                                    { name: "Other", value: "other" }
                                ]}
                                value={data.sex}
                                name="sex"
                                onChange={handleChange}
                                label="Выберите ваш пол"
                            />
                            <MultiSelectField
                                defaultValue={data.qualities}
                                options={qualities}
                                onChange={handleChange}
                                name="qualities"
                                label="Выберите ваши качества"
                            />
                            <button
                                type="submit"
                                disabled={!isValid}
                                className="btn btn-primary w-100 mx-auto"
                            >
                                Обновить
                            </button>
                        </form>
                    ) : (
                        // добавила сообщение о загрузке
                        "Loading"
                    )}
                </div>
            </div>
        </div>
    );
};

export default EditUserPage;
