"use client"
import Stepper, { Step } from '@/components/Stepper';
import { Input } from "@/components/ui/input"
import { useState, useMemo } from 'react'
import debounce from 'lodash/debounce';

export default function Page() {
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState<undefined | boolean>(undefined);
    const [password, setPassword] = useState('');
    
    const [lengthErr, setLengthErr] = useState<boolean>(false);
    const [spaceErr, setSpaceErr] = useState<boolean>(false);
    const [userNameErr, setUserNameErr] = useState<boolean>(false);
    const [upperCaseErr, setUpperCaseErr] = useState<boolean>(false);
    const [lowerCaseErr, setLowerCaseErr] = useState<boolean>(false);
    const [numberErr, setNumberErr] = useState<boolean>(false);
    const [specialCharErr, setSpecialCharErr] = useState<boolean>(false);
    const passwordError = useMemo(() => {
        return lengthErr || spaceErr || userNameErr || upperCaseErr || lowerCaseErr || numberErr || specialCharErr;
    },[lengthErr, spaceErr, userNameErr, upperCaseErr, lowerCaseErr, numberErr, specialCharErr]);
    const disabled = useMemo(() => {
        return emailError || passwordError || email === '' || password === '';
    },[emailError, passwordError, email, password]);

    // 邮箱验证函数
    const validateEmail = (email: string) => {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
    };

    // 密码验证函数
    const validatePassword = (password: string, email: string) => {
        // 密码长度检查（8-32位）
        if (password.length < 8 || password.length > 32) {
            setLengthErr(true);
        }else {
            setLengthErr(false);
        }

        // 检查是否包含空格
        if (/\s/.test(password)) {
            setSpaceErr(true);
        }else {
            setSpaceErr(false);
        }

        // 检查密码是否包含邮箱用户名
        const userName = email.split('@')[0];
        if (userName && password.toLowerCase().includes(userName.toLowerCase())) {
            setUserNameErr(true);
        }else {
            setUserNameErr(false);
        }

        // 使用正则表达式检查密码复杂度要求
        if (!/[A-Z]/.test(password)){
            setUpperCaseErr(true);
        }else {
            setUpperCaseErr(false);
        }
        if (!/[a-z]/.test(password)){
            setLowerCaseErr(true);
        }else {
            setLowerCaseErr(false);
        }
        if (!/[0-9]/.test(password)){
            setNumberErr(true);
        }else {
            setNumberErr(false);
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)){
            setSpecialCharErr(true);
        }else {
            setSpecialCharErr(false);
        }
    };

    const debouncedValidatePassword = debounce((password: string, email: string) => {
        validatePassword(password, email)
    }, 300);

    // 创建邮箱验证的防抖函数
    const debouncedValidateEmail = debounce((email: string) => {
        setEmailError(() => !validateEmail(email));
    }, 300);

    // 修改密码输入框的onChange处理函数
    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newPassword = e.target.value;
        setPassword(newPassword);
        debouncedValidatePassword(newPassword, email);
    };

    // 修改邮箱输入框的onChange处理函数
    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newEmail = e.target.value;
        setEmail(newEmail);
        debouncedValidateEmail(newEmail);
    };

    return (
        <div className="h-full w-full flex items-center justify-center">
            <Stepper
                initialStep={1}
                onStepChange={(step) => {
                    console.log(step);
                }}
                onFinalStepCompleted={() => console.log("All steps completed!")}
                backButtonText="上一步"
                nextButtonText="下一步"
                stepCircleContainerClassName="border-primary-500"
                nextButtonProps={{
                    disabled: disabled,
                }}
                >
                <Step>
                    <div className='flex flex-col gap-4'>
                        <span className='text-primary'>😇欢迎来到我的小破屋🏠</span>
                        <div className='flex flex-col gap-2'>
                            <h2 className='text-primary'>Email</h2>
                            <Input 
                                type='email' 
                                placeholder='Email' 
                                value={email} 
                                onChange={handleEmailChange}
                                onFocus={() => {
                                    if (email) {
                                        debouncedValidateEmail(email);
                                    }
                                }}
                                className={emailError ? 'border-red-600' : ''}
                            />
                            {emailError && <p className="text-red-600 text-sm mt-1">请输入有效的邮箱地址</p>}
                        </div>
                        <div className='flex flex-col gap-2'>
                            <h2 className='text-primary'>Password</h2>
                            <Input 
                                type='password' 
                                placeholder='Password' 
                                value={password}
                                onChange={handlePasswordChange}
                                onFocus={() => {
                                    if (password) {
                                        debouncedValidatePassword(password, email);
                                    }
                                }}
                                className={passwordError? 'border-red-600' : ''}
                                />
                                {passwordError && (
                                    <div className="text-primary text-sm mt-1">
                                        <p>密码必须满足以下要求：</p>
                                        <ul className="list-disc pl-4 mt-1">
                                            <li className={lengthErr ? 'text-red-500': 'text-green-500'}>长度在8-32位之间</li>
                                            <li className={spaceErr ? 'text-red-500': 'text-green-500'}>不能包含空格</li>
                                            <li className={userNameErr ? 'text-red-500': 'text-green-500'}>不能包含邮箱用户名</li>
                                            <li className={upperCaseErr ? 'text-red-500': 'text-green-500'}>必须包含大写字母</li>
                                            <li className={lowerCaseErr ? 'text-red-500': 'text-green-500'}>必须包含小写字母</li>
                                            <li className={numberErr ? 'text-red-500': 'text-green-500'}>必须包含数字</li>
                                            <li className={specialCharErr ? 'text-red-500': 'text-green-500'}>{`必须包含特殊字符（!@#$%^&*(),.?":{}|<>)`}</li>
                                        </ul>
                                    </div>
                                )}
                        </div>
                    </div>
                </Step>
                <Step>
                    <h2>验证码获取</h2>

                    <p>Custom step content!</p>
                </Step>
                <Step>
                    <h2>How about an input?</h2>
                    {/* <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name?" /> */}
                </Step>
                <Step>
                    <h2>Final Step</h2>
                    <p>You made it!</p>
                </Step>
            </Stepper>
        </div>
    )
}