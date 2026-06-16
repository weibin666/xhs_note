from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from ..db import get_session
from ..db_models import Account
from ..schemas.models import AccountCreate, AccountUpdate

router = APIRouter(prefix="/api/accounts", tags=["accounts"])


@router.get("", response_model=List[Account])
def list_accounts(session: Session = Depends(get_session)):
    return session.exec(select(Account).order_by(Account.created_at.desc())).all()


@router.post("", response_model=Account)
def create_account(data: AccountCreate, session: Session = Depends(get_session)):
    acc = Account(**data.model_dump())
    session.add(acc)
    session.commit()
    session.refresh(acc)
    return acc


@router.patch("/{account_id}", response_model=Account)
def update_account(account_id: int, data: AccountUpdate, session: Session = Depends(get_session)):
    acc = session.get(Account, account_id)
    if not acc:
        raise HTTPException(404, "账号档案不存在")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(acc, k, v)
    session.add(acc)
    session.commit()
    session.refresh(acc)
    return acc


@router.delete("/{account_id}")
def delete_account(account_id: int, session: Session = Depends(get_session)):
    acc = session.get(Account, account_id)
    if not acc:
        raise HTTPException(404, "账号档案不存在")
    session.delete(acc)
    session.commit()
    return {"ok": True}
