import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { Contract, providers, ethers } from 'ethers';
import Web3Modal from 'web3modal';

import {
  CLOCKING_CONTRACT_ADDRESS,
  CLOCKING_CONTRACT_ABI
} from "./contract";

function App() {
  const CHAIN_ID = 11155111;
  const NETWORK_NAME = "Sepolia";

  const [walletConnected, setWalletConnected] = useState(false);
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null)
  const [loading, setLoading] = useState(false);
  const [contractOwner, setContractOwner] = useState(null);

  const [registerStaffAddress, setRegisterStaffAddress] = useState(null);
  const [registerStaffName, setRegisterStaffName] = useState(null);

  const [attendanceMonth, setAttendanceMonth] = useState("january");
  const [workingDays, setWorkingDays] = useState(null);

  const [attendanceWallet, setAttendanceWallet] = useState(null);
  const [viewedStaffAttendance, setViewedStaffAttendance] = useState([]);
  const [viewedStaffName, setViewedStaffName] = useState("");

  const [connectedAccountAttendance, setConnectedAccountAttendance] = useState([]);
  const [connectedAccountName, setConnectedAccountName] = useState("");

  const web3ModalRef = useRef();

  // Helper function to fetch a Provider instance from Metamask
  const getProvider = useCallback(async () => {
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);
    const getSigner = web3Provider.getSigner();

    const { chainId } = await web3Provider.getNetwork();

    setAccount(await getSigner.getAddress());
    setWalletConnected(true)


    if (chainId !== CHAIN_ID) {
    window.alert(`Please switch to the ${NETWORK_NAME} network!`);
        throw new Error(`Please switch to the ${NETWORK_NAME} network`);
    }
    setProvider(web3Provider);
  }, []);


  // Helper function to fetch a Signer instance from Metamask
  const getSigner = useCallback(async () => {
    const web3Modal = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(web3Modal);

    const { chainId } = await web3Provider.getNetwork();

    if (chainId !== CHAIN_ID) {
    window.alert(`Please switch to the ${NETWORK_NAME} network!`);
        throw new Error(`Please switch to the ${NETWORK_NAME} network`);
    }
    
    const signer = web3Provider.getSigner();
    return signer;
  }, []);

  function convertTimestampToReadable(unixTimestamp) {
    // Create a new Date object with the Unix timestamp multiplied by 1000
    // (JavaScript Date expects milliseconds)
    const date = new Date(unixTimestamp * 1000);

    // Format the date to a readable format (e.g., "YYYY-MM-DD HH:MM:SS")
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2); // +1 because months start at 0
    const day = ('0' + date.getDate()).slice(-2);
    const hours = ('0' + date.getHours()).slice(-2);
    const minutes = ('0' + date.getMinutes()).slice(-2);
    const seconds = ('0' + date.getSeconds()).slice(-2);

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  const calculateWorkingHours = (clockInTimestamp, clockOutTimestamp) => {
    const hoursWorked = (clockOutTimestamp - clockInTimestamp) / 3600; // Convert seconds to hours
    return hoursWorked.toFixed(2); // Round to 2 decimal places
  };


  const getClockingContractInstance = useCallback((providerOrSigner) => {
    return new Contract(
      CLOCKING_CONTRACT_ADDRESS,
      CLOCKING_CONTRACT_ABI,
      providerOrSigner
    )
  },[]);


  const connectWallet = useCallback(async () => {
    try {
        web3ModalRef.current = new Web3Modal({
            network: NETWORK_NAME,
            providerOptions: {},
            disableInjectedProvider: false,
        });

        await getProvider();
    } catch (error) {
        console.error(error);
    }
  },[getProvider]);

  const registerStaff = async (e) => {
    e.preventDefault();

    if(registerStaffAddress === null || registerStaffName === null) {
      alert("Fill in staff address and staff name to register");
    } else {
      try {

        const signer = await getSigner();
        const clockingContract = getClockingContractInstance(signer);
        const registerTxn = await clockingContract.registerStaff(registerStaffAddress, registerStaffName);

        setLoading(true);
        await registerTxn.wait();
        setLoading(false);

      } catch (error) {
        console.error(error);
      }
    }
  }

  const setupClockingDuration = async (e) => {
    e.preventDefault();

    if(attendanceMonth === null || workingDays === null) {
      alert("Select month and input number of days");
    } else {
      try {
        const signer = await getSigner();
        const clockingContract = getClockingContractInstance(signer);
        const setupClockingPeriodTxn = await clockingContract.setupClockingPeriod(attendanceMonth, workingDays);

        setLoading(true);
        await setupClockingPeriodTxn.wait();
        setLoading(false);
      } catch (error) {
        console.error(error);
      }
    }
  }

  const viewAttendance = async (e) => {
    e.preventDefault();

    if(attendanceWallet === null) {
      alert("Input the attendance wallet you want to view its attendance records")
    } else {
      try {
        const clockingContract = getClockingContractInstance(provider);
        const staffAttendance = await clockingContract.getStaffAttendance(attendanceWallet);
        const staffName = await clockingContract.getStaffName(attendanceWallet);
        
        setViewedStaffAttendance(staffAttendance);
        setViewedStaffName(staffName);
      } catch (error) {
        console.error(error);
      }
    }
  }

  const clockIn = async (e) => {
    e.preventDefault();

    try {
      const signer = await getSigner();
      const clockingContract = getClockingContractInstance(signer);

      const clockInTxn = await clockingContract.clockIn();

      setLoading(true);
      await clockInTxn.wait();
      setLoading(false);

      const staffAttendance = await clockingContract.getStaffAttendance(account);
      setConnectedAccountAttendance(staffAttendance);
    } catch (error) {
      console.error(error);
    }
  }

  const clockOut = async (attendanceIndex) => {

    try {
      const signer = await getSigner();
      const clockingContract = getClockingContractInstance(signer);

      const clockOutTxn = await clockingContract.clockOut(attendanceIndex);

      setLoading(true);
      await clockOutTxn.wait();
      setLoading(false);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    const fetchClockingContractDetails = async () => {
      if(account && provider) {
        try {
          const clockingContract = getClockingContractInstance(provider);
          const owner = await clockingContract.owner();
          const staffAttendance = await clockingContract.getStaffAttendance(account);
          const staffName = await clockingContract.getStaffName(account);
          
          setContractOwner(owner);
          setConnectedAccountAttendance(staffAttendance);
          setConnectedAccountName(staffName);
        } catch (error) {
          console.error(error);
        }
      }
    }

    fetchClockingContractDetails();
  }, [account, provider, connectedAccountAttendance]);


  useEffect(() => {
    if(!walletConnected) {
        connectWallet();
    }
  }, [walletConnected, connectWallet]);

  return (
    <div className="App">
      <div className="container mb-5">
        <nav className="navbar navbar-expand-lg navbar-light bg-primary">
          <a className="navbar-brand text-white" href="!#">
            Clocking dApp
          </a>
          <button
            className="navbar-toggler"
            type="button"
            data-toggle="collapse"
            data-target="#navbarText"
            aria-controls="navbarText"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarText">
            <ul className="navbar-nav mr-auto">
              
            </ul>
            
            <span className="navbar-text">
              {!walletConnected ? <button className="btn btn-danger" onClick={connectWallet}>Connect Wallet</button> : <button className="btn btn-dark" disabled>{account !== null ? account : "Connected"}</button>}
            </span>
          </div>
        </nav>

        {account !== null && contractOwner !== null && account === contractOwner &&
          <div>
            <div className="row mt-5">
              <div className="col-md-6">
                <div className="card">
                  <div className="card-body">
                    <form action="">
                      <div className="form-group">
                        <label htmlFor="staff_address">Staff Address</label>
                        <input onChange={(e) => setRegisterStaffAddress(e.target.value)} id="staff_address" type="text" className="form-control" placeholder="Staff wallet address" />
                      </div>

                      <div className="form-group">
                        <label htmlFor="staff_name">Staff Name</label>
                        <input onChange={(e) => setRegisterStaffName(e.target.value)} id="staff_name" type="text" className="form-control" placeholder="Staff name" />
                      </div>

                      {loading ? <p>Loading...</p> : <button className="btn btn-primary btn-block" onClick={registerStaff}>Register staff</button>}
                    </form>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="card">
                  <div className="card-body">
                    <form action="">
                      <div className="form-group">
                        <label htmlFor="month">Month</label>
                        <select onChange={(e) => setAttendanceMonth(e.target.value)} id="month" className="form-control">
                          <option value="january">January</option>
                          <option value="february">February</option>
                          <option value="march">March</option>
                          <option value="april">April</option>
                          <option value="may">May</option>
                          <option value="june">June</option>
                          <option value="july">July</option>
                          <option value="august">August</option>
                          <option value="september">September</option>
                          <option value="october">October</option>
                          <option value="november">November</option>
                          <option value="december">December</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label htmlFor="working_days">No. of working days</label>
                        <input onChange={(e) => setWorkingDays(e.target.value)} id="working_days" type="number" className="form-control" placeholder="Working days" />
                      </div>

                      {loading ? <p>Loading...</p> : <button className="btn btn-primary btn-block" onClick={setupClockingDuration}>Setup Clocking Duration</button>}
                    </form>
                  </div>
                </div>
              </div>
            </div>

            <div className="row mt-5">
              <div className="col-md-12">
                <div className="card">
                  <div className="card-body">
                    <form action="">
                      <div className="form-group">
                        <label htmlFor="staff_wallet">Staff Wallet</label>
                        <input onChange={(e) => setAttendanceWallet(e.target.value)} id="staff_wallet" type="text" className="form-control" placeholder="Staff wallet" />
                      </div>

                      {loading ? <p>Loading...</p> : <button className="btn btn-primary" onClick={viewAttendance}>View Attendance</button>}
                    </form>

                    {viewedStaffAttendance.length > 0 &&
                      <div className="table-responsive mt-3">
                        {viewedStaffName !== "" && <h4>Attendance Records for {viewedStaffName}</h4>}
                        <table className="table table-striped">
                          <thead>
                            <tr>
                              <th scope="col">#</th>
                              <th scope="col">Month</th>
                              <th scope="col">Clocked In</th>
                              <th scope="col">Clocked Out</th>
                              <th scope="col">Work Hours</th>
                            </tr>
                          </thead>

                          <tbody>
                            {viewedStaffAttendance.map((attendance, index) => (
                              <tr key={index}>
                                <th scope="row">1</th>
                                <td>{attendance.month}</td>
                                <td>{convertTimestampToReadable(attendance.signIn)}</td>
                                <td>{convertTimestampToReadable(attendance.signOut)}</td>
                                <td>{Number(attendance.signOut) === 0 ? 0 : calculateWorkingHours(attendance.signIn, attendance.signOut)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        }

        {account !== null && 
          <div className="row mt-5">
            <div className="col-md-12">
              {connectedAccountName !== "" && <h4>Welcome {connectedAccountName}</h4>}
              <div className="card">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    {loading ? <p>Loading...</p> : <button className="btn btn-success btn-lg" onClick={clockIn}>Clock In</button>}
                  </div>


                  {connectedAccountAttendance.length > 0 &&
                    <div className="table-responsive mt-3">
                      <h4 className="mb-3">Your Attendance Records</h4>
                      <table className="table table-striped">
                        <thead>
                          <tr>
                            <th scope="col">#</th>
                            <th scope="col">Month</th>
                            <th scope="col">Clocked In</th>
                            <th scope="col">Clocked Out</th>
                            <th scope="col">Work Hours</th>
                            <th scope="col">Action</th>
                          </tr>
                        </thead>

                        <tbody>
                          {connectedAccountAttendance.map((attendance, index) => (
                            <tr key={index}>
                              <th scope="row">1</th>
                              <td>{attendance.month}</td>
                              <td>{convertTimestampToReadable(attendance.signIn)}</td>
                              <td>{convertTimestampToReadable(attendance.signOut)}</td>
                              <td>{Number(attendance.signOut) === 0 ? 0 : calculateWorkingHours(attendance.signIn, attendance.signOut)}</td>
                              <td>
                                {Number(attendance.signOut) !== 0 ? "completed" : <button className="btn btn-danger btn-sm" onClick={() => clockOut(index)}>Clock out</button>}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  );
}

export default App;
