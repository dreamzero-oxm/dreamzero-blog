"use client"
import Stepper, { Step } from '@/components/Stepper';
import { Input } from "@/components/ui/input"
import { useState, useMemo, useEffect, useCallback } from 'react'
import debounce from 'lodash/debounce';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
  } from "@/components/ui/input-otp"
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
import { 
    useUserGetEmailVerificationCode, 
    useUserVerifyEmailVerificationCode,
    useUserCheckUserName,
    useUserRegister,
    useUserCheckEmail,
} from '@/hooks/user-hook'
import { toast } from 'sonner';

export default function Page() {
    // all
    const [step, setStep] = useState<number>(1);
    // step 1 variation
    const [userName, setUserName] = useState('');
    const {error: userNameInValiate, mutate: validateUserName} = useUserCheckUserName();
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState<undefined | boolean>(undefined);
    const [password, setPassword] = useState('');
    // step 1 error
    const {error: emailIsCreate, mutate: checkEmail} = useUserCheckEmail();
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

    // step 2 variation
    const [verificationCode, setVerificationCode] = useState('');
    const [countdown, setCountdown] = useState(0);
    const [sendEmailClickFlag, setSendEmailClickFlag] = useState<boolean>(false);
    const sendEmailButtonText = useMemo(() => {
        if (countdown > 0) {
            return `${countdown}s后可重新发送`;
        }else if (!sendEmailClickFlag) {
            return '获取邮箱📮验证码🐎';
        }else {
            return '重新获取邮箱📮验证码🐎';
        }
    },[countdown, sendEmailClickFlag]);
    const {mutate: getEmailVerificationCode} = useUserGetEmailVerificationCode();
    const {mutate: verifyVerificationCode, error: vericationCodeError} = useUserVerifyEmailVerificationCode();

    // step 3 register
    const {mutate: userRegister, error: registerErr, isPending: registerIsPending} = useUserRegister();
    const [isSendRegister, setIsSendRegister] = useState<boolean>(false);
    const [toastLodingId, setToastLodingId] = useState<number | string | null>(null);

    // 处理获取验证码
    const handleGetVerificationCode = () => {
        // 设置点击标志
        setSendEmailClickFlag(true);
        // TODO: 这里添加发送验证码的逻辑
        getEmailVerificationCode(email);
        // 设置倒计时
        setCountdown(60);
        // 开始倒计时
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        // TODO: 这里添加发送验证码的逻辑
        console.log('发送验证码');
    };

    // 邮箱验证函数
    const validateEmail = useCallback((email: string) => {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const result = emailRegex.test(email);
        if (result) {
            checkEmail(email);
        }
        return result;
    }, [checkEmail]);

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

    // 创建检测用户名的防抖函数
    const debouncedValidateUserName = debounce((userName: string) => {
        if (userName.length === 0) {
            return ;
        }
        validateUserName(userName);
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

    // 修改用户名的onChange处理函数
    const handleUserNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        setUserName(name);
        debouncedValidateUserName(name);
    };

    // disbale 
    const disabled = useMemo<boolean>(() => {
        switch (step) {
            case 1:
                return emailError || passwordError || email === '' || password === '' || userNameInValiate != null || userName.length === 0 || emailIsCreate !== null;
            case 2:
                return verificationCode.length !== 6 || vericationCodeError != null;
            case 3 :
                // 验证邮箱和密码
                validateEmail(email);
                validatePassword(password, email);
                // 验证用户名
                validateUserName(userName);
                // 验证验证码
                verifyVerificationCode({
                    email: email,
                    verification_code: verificationCode,
                });
                // 验证所有
                return isSendRegister || registerIsPending || emailError || passwordError || email === '' || password === '' || userNameInValiate!= null || userName.length === 0 || verificationCode.length!== 6 || vericationCodeError!= null;
            default:
                return false;
        }
    },[step, emailError, emailIsCreate, passwordError, email, password, verificationCode, vericationCodeError, userNameInValiate, userName, isSendRegister, registerIsPending, validateUserName, verifyVerificationCode, validateEmail]);


    // effect
    useEffect(() => {
        if (isSendRegister && (registerErr || !registerIsPending) && toastLodingId !== null) {
            toast.dismiss(toastLodingId);   
            setIsSendRegister(false);
        }
        return () => {
            if (toastLodingId!== null) {
                toast.dismiss(toastLodingId);
            }
        }
    },[registerErr, isSendRegister, toastLodingId, registerIsPending]);

    return (
        <div className="h-full w-full flex items-center justify-center">
            <Stepper
                initialStep={step}
                onStepChange={(step) => {
                    setStep(step);
                }}
                onFinalStepCompleted={()=>{
                    userRegister({user_name: userName, email: email, password: password, verification_code: verificationCode});
                    setIsSendRegister(true);
                    setToastLodingId(toast.loading('注册中...'));
                }}
                backButtonText="上一步"
                nextButtonText="下一步"
                stepCircleContainerClassName="border-primary-500"
                nextButtonProps={{
                    disabled: disabled,
                }}
                disableStepIndicators={true}
                >
                <Step>
                    <div className='flex flex-col gap-4'>
                        <span className='text-primary'>😇欢迎来到我的小破屋🏠</span>
                        <div className='flex flex-col gap-2'>
                            <h2 className='text-primary'>邮箱Email</h2>
                            <Input 
                                type='email' 
                                placeholder='Email' 
                                value={email} 
                                onChange={handleEmailChange}
                                onFocus={() => {
                                    if (email && (emailError === undefined || emailError === false) && emailIsCreate === null) {
                                        debouncedValidateEmail(email);
                                    }
                                }}
                                className={emailError || emailIsCreate ? 'border-red-600' : ''}
                            />
                            {emailError && <p className="text-red-600 text-sm mt-1">请输入有效的邮箱地址</p>}
                            {emailIsCreate && <p className="text-red-600 text-sm mt-1">该邮箱已被注册</p>}
                        </div>
                        <div className='flex flex-col gap-2'>
                            <h2 className='text-primary'>用户名</h2>
                            <Input 
                                type='text' 
                                placeholder='你的用户名' 
                                value={userName} 
                                onChange={handleUserNameChange}
                                onFocus={() => {
                                    if (userName && userNameInValiate === null) {
                                        debouncedValidateUserName(userName);
                                    }
                                }}
                                className={userName.length > 0 && userNameInValiate ? 'border-red-600' : ''}
                            />
                            {userName.length > 0 && userNameInValiate && <p className="text-red-600 text-sm mt-1">该用户名已被占用</p>}
                        </div>
                        <div className='flex flex-col gap-2'>
                            <h2 className='text-primary'>Password</h2>
                            <Input 
                                type='password' 
                                placeholder='Password' 
                                value={password}
                                onChange={handlePasswordChange}
                                onFocus={() => {
                                    if (password && passwordError === false) {
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
                    <div className='flex flex-col gap-4'>
                        <Button 
                            onClick={handleGetVerificationCode}
                            disabled={countdown > 0}
                            className='w-sm'
                        >
                            {sendEmailButtonText}
                        </Button>
                        <div className='flex justify-center'>
                            <InputOTP 
                                maxLength={6}
                                value={verificationCode}
                                onChange={(value) => {
                                    setVerificationCode(value);
                                    if (value.length === 6) {
                                        verifyVerificationCode({
                                            email: email,
                                            verification_code: value,
                                        });
                                    }
                                }}
                            >
                                <InputOTPGroup>
                                    <InputOTPSlot index={0} />
                                    <InputOTPSlot index={1} />
                                    <InputOTPSlot index={2} />
                                </InputOTPGroup>
                                <InputOTPSeparator />
                                <InputOTPGroup>
                                    <InputOTPSlot index={3} />
                                    <InputOTPSlot index={4} />
                                    <InputOTPSlot index={5} />
                                </InputOTPGroup>
                            </InputOTP>
                        </div>
                    </div>
                </Step>
                <Step>
                    <Card>
                        <CardHeader>
                            <CardTitle>用户信息</CardTitle>
                            <CardDescription>User Information</CardDescription>
                        </CardHeader>
                        <CardContent className='felx flex-col gap-2'>
                            <div className='text-primary'>用户邮箱: {email}</div>
                            <div className='text-primary'>用户名: {userName}</div>
                        </CardContent>
                        <CardFooter>
                            <p>🥳🥳🥳🥳🥳🥳🥳🥳🥳🥳🥳🥳🥳🥳</p>
                        </CardFooter>
                    </Card>
                </Step>
            </Stepper>
        </div>
    )
}