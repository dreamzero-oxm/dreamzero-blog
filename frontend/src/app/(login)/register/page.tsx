/**
 * @file /Users/mac/code/projects/dreamzero-blog/frontend/src/app/(login)/register/page.tsx
 * @description 用户注册页面组件，提供三步式用户注册流程
 * @mainFunctionality 提供用户注册表单，包括基本信息输入、邮箱验证和确认注册三个步骤
 * @author DreamZero Team
 * @lastModified 2023-12-01
 */

"use client" // 声明为客户端组件，因为使用了React hooks和事件处理

// 导入所需的React组件和自定义组件
import Stepper, { Step } from '@/components/Stepper'; // 导入步骤导航组件
import { Input } from "@/components/ui/input" // 导入输入框组件
import { useState, useMemo, useEffect, useCallback } from 'react' // 导入React hooks
import debounce from 'lodash/debounce'; // 导入防抖函数，用于优化输入验证
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
  } from "@/components/ui/input-otp" // 导入一次性密码输入组件
import { Button } from "@/components/ui/button"; // 导入按钮组件
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card" // 导入卡片组件
import { 
    useUserGetEmailVerificationCode, // 导入获取邮箱验证码的hook
    useUserVerifyEmailVerificationCode, // 导入验证邮箱验证码的hook
    useUserCheckUserName, // 导入检查用户名是否可用的hook
    useUserRegister, // 导入用户注册的hook
    useUserCheckEmail, // 导入检查邮箱是否已注册的hook
} from '@/hooks/user-hook' // 导入用户相关的自定义hooks
import { toast } from 'sonner'; // 导入通知组件，用于显示操作反馈

/**
 * @component Page
 * @description 用户注册页面组件，提供三步式注册流程
 * @functionality 
 *   - 第一步：收集用户基本信息（用户名、邮箱、密码）
 *   - 第二步：邮箱验证码验证
 *   - 第三步：确认注册信息并完成注册
 * @stateManagement 使用React hooks管理组件状态，包括表单数据、验证状态和UI状态
 * @returns {JSX.Element} 返回用户注册页面的JSX结构
 */
export default function Page() {
    // ===== 全局状态变量 =====
    // 当前注册步骤，1-基本信息，2-邮箱验证，3-确认注册
    const [step, setStep] = useState<number>(1);
    
    // ===== 第一步状态变量：基本信息 =====
    // 用户名状态
    const [userName, setUserName] = useState('');
    // 用户名验证hook，检查用户名是否已被占用
    const {error: userNameInValiate, mutate: validateUserName} = useUserCheckUserName();
    // 邮箱状态
    const [email, setEmail] = useState('');
    // 邮箱格式验证状态，undefined-未验证，true-验证通过，false-验证失败
    const [emailError, setEmailError] = useState<undefined | boolean>(undefined);
    // 密码状态
    const [password, setPassword] = useState('');
    
    // ===== 第一步状态变量：验证错误 =====
    // 邮箱是否已注册验证hook，null-未验证，有值-已注册
    const {error: emailIsCreate, mutate: checkEmail} = useUserCheckEmail();
    // 密码长度错误状态
    const [lengthErr, setLengthErr] = useState<boolean>(false);
    // 密码包含空格错误状态
    const [spaceErr, setSpaceErr] = useState<boolean>(false);
    // 密码包含用户名错误状态
    const [userNameErr, setUserNameErr] = useState<boolean>(false);
    // 密码缺少大写字母错误状态
    const [upperCaseErr, setUpperCaseErr] = useState<boolean>(false);
    // 密码缺少小写字母错误状态
    const [lowerCaseErr, setLowerCaseErr] = useState<boolean>(false);
    // 密码缺少数字错误状态
    const [numberErr, setNumberErr] = useState<boolean>(false);
    // 密码缺少特殊字符错误状态
    const [specialCharErr, setSpecialCharErr] = useState<boolean>(false);
    
    /**
     * @description 计算密码是否有错误
     * @returns {boolean} 如果密码有任何错误则返回true，否则返回false
     * @dependency 依赖于所有密码验证错误状态
     */
    const passwordError = useMemo(() => {
        return lengthErr || spaceErr || userNameErr || upperCaseErr || lowerCaseErr || numberErr || specialCharErr;
    },[lengthErr, spaceErr, userNameErr, upperCaseErr, lowerCaseErr, numberErr, specialCharErr]);

    // ===== 第二步状态变量：邮箱验证 =====
    // 邮箱验证码状态
    const [verificationCode, setVerificationCode] = useState('');
    // 验证码重发倒计时状态
    const [countdown, setCountdown] = useState(0);
    // 是否已点击发送验证码标志
    const [sendEmailClickFlag, setSendEmailClickFlag] = useState<boolean>(false);
    
    /**
     * @description 计算验证码按钮文本
     * @returns {string} 根据倒计时状态和点击标志返回不同的按钮文本
     * @dependency 依赖于倒计时状态和点击标志
     */
    const sendEmailButtonText = useMemo(() => {
        if (countdown > 0) {
            return `${countdown}s后可重新发送`;
        }else if (!sendEmailClickFlag) {
            return '获取邮箱📮验证码🐎';
        }else {
            return '重新获取邮箱📮验证码🐎';
        }
    },[countdown, sendEmailClickFlag]);
    
    // 获取邮箱验证码hook
    const {mutate: getEmailVerificationCode} = useUserGetEmailVerificationCode();
    // 邮箱验证码验证hook，检查验证码是否正确
    const {mutate: verifyVerificationCode, error: vericationCodeError} = useUserVerifyEmailVerificationCode();

    // ===== 第三步状态变量：注册确认 =====
    // 用户注册hook，包含注册状态和错误信息
    const {mutate: userRegister, error: registerErr, isPending: registerIsPending} = useUserRegister();
    // 是否已发送注册请求状态
    const [isSendRegister, setIsSendRegister] = useState<boolean>(false);
    // 加载提示通知ID状态
    const [toastLodingId, setToastLodingId] = useState<number | string | null>(null);

    /**
     * @description 处理获取验证码按钮点击事件
     * @functionality 
     *   - 调用API获取邮箱验证码
     *   - 设置60秒倒计时
     *   - 设置已点击标志
     *   - 启动定时器更新倒计时
     * @dependency 依赖于获取验证码API和邮箱状态
     */
    const handleGetVerificationCode = () => {
        // 设置点击标志
        setSendEmailClickFlag(true);
        // 调用API获取验证码
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
    };

    /**
     * @description 邮箱格式验证函数
     * @param {string} email - 待验证的邮箱地址
     * @returns {boolean} 邮箱格式是否有效
     * @functionality 
     *   - 使用正则表达式验证邮箱格式
     *   - 如果格式有效，检查邮箱是否已被注册
     * @dependency 依赖于检查邮箱注册状态的hook
     */
    const validateEmail = useCallback((email: string) => {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const result = emailRegex.test(email);
        if (result) {
            checkEmail(email);
        }
        return result;
    }, [checkEmail]);

    /**
     * @description 密码强度验证函数
     * @param {string} password - 待验证的密码
     * @param {string} email - 用户邮箱（用于检查密码是否包含邮箱用户名）
     * @functionality 
     *   - 检查密码长度（8-32位）
     *   - 检查是否包含空格
     *   - 检查是否包含邮箱用户名
     *   - 检查是否包含大写字母、小写字母、数字、特殊字符
     * @dependency 更新所有密码验证错误状态
     */
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

    /**
     * @description 密码验证防抖函数
     * @param {string} password - 待验证的密码
     * @param {string} email - 用户邮箱
     * @functionality 延迟300ms执行密码验证，避免频繁验证
     * @dependency 依赖于validatePassword函数
     */
    const debouncedValidatePassword = debounce((password: string, email: string) => {
        validatePassword(password, email)
    }, 300);

    /**
     * @description 邮箱验证防抖函数
     * @param {string} email - 待验证的邮箱
     * @functionality 延迟300ms执行邮箱验证，避免频繁验证
     * @dependency 依赖于validateEmail函数
     */
    const debouncedValidateEmail = debounce((email: string) => {
        setEmailError(() => !validateEmail(email));
    }, 300);

    /**
     * @description 用户名验证防抖函数
     * @param {string} userName - 待验证的用户名
     * @functionality 延迟300ms执行用户名验证，避免频繁验证
     * @dependency 依赖于validateUserName hook
     */
    const debouncedValidateUserName = debounce((userName: string) => {
        if (userName.length === 0) {
            return ;
        }
        validateUserName(userName);
    }, 300);

    /**
     * @description 处理密码输入变化事件
     * @param {React.ChangeEvent<HTMLInputElement>} e - 输入框变化事件对象
     * @functionality 
     *   - 更新密码状态
     *   - 使用防抖函数验证密码强度
     * @dependency 依赖于防抖验证函数和邮箱状态
     */
    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newPassword = e.target.value;
        setPassword(newPassword);
        debouncedValidatePassword(newPassword, email);
    };

    /**
     * @description 处理邮箱输入变化事件
     * @param {React.ChangeEvent<HTMLInputElement>} e - 输入框变化事件对象
     * @functionality 
     *   - 更新邮箱状态
     *   - 使用防抖函数验证邮箱格式
     * @dependency 依赖于防抖验证函数
     */
    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newEmail = e.target.value;
        setEmail(newEmail);
        debouncedValidateEmail(newEmail);
    };

    /**
     * @description 处理用户名输入变化事件
     * @param {React.ChangeEvent<HTMLInputElement>} e - 输入框变化事件对象
     * @functionality 
     *   - 更新用户名状态
     *   - 使用防抖函数验证用户名是否可用
     * @dependency 依赖于防抖验证函数
     */
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


    // ===== 副作用钩子 =====
    
    /**
     * @description 监听注册请求状态变化，管理加载提示的显示和隐藏
     * @dependency 依赖于注册请求状态、注册错误信息、发送注册标志和加载提示ID
     * @functionality 
     *   - 当注册请求完成（成功或失败）且存在加载提示时，关闭加载提示
     *   - 重置发送注册标志状态
     *   - 清理函数：组件卸载时关闭所有未关闭的加载提示
     */
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
                completeButtonText="完成注册"
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
                            <h2 className='text-primary'>密码</h2>
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