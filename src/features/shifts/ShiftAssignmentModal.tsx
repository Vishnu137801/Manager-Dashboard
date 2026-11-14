import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useApp } from '../../app/AppContext';
import { FormModal } from '../../components/ui/FormModal';
import { TODAY_ISO } from '../../mock-data/seedData';

const shiftAssignmentSchema = z.object({
  employeeId: z.string().min(1, 'Select an employee'),
  shiftId: z.string().min(1, 'Select a shift'),
  date: z.string().min(1, 'Select a date'),
  branchId: z.string().min(1, 'Select a branch'),
  location: z.string().min(2, 'Enter work location'),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  breakDuration: z.coerce.number().min(15).max(120),
  weeklyOff: z.string().min(1),
  notes: z.string().optional(),
});

type ShiftAssignmentFormValues = z.infer<typeof shiftAssignmentSchema>;

interface ShiftAssignmentModalProps {
  open: boolean;
  onClose: () => void;
}

export const ShiftAssignmentModal: React.FC<ShiftAssignmentModalProps> = ({ open, onClose }) => {
  const { scopedEmployees, shifts, branches, assignShift } = useApp();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ShiftAssignmentFormValues>({
    resolver: zodResolver(shiftAssignmentSchema) as never,
    defaultValues: {
      employeeId: scopedEmployees[0]?.id || '',
      shiftId: shifts[1]?.id || 'sh-general',
      date: TODAY_ISO,
      branchId: branches[0]?.id || 'br-blr',
      location: branches[0]?.name || 'Bengaluru Central Hub',
      startTime: '09:00',
      endTime: '18:00',
      breakDuration: 60,
      weeklyOff: 'Saturday & Sunday',
      notes: '',
    },
  });

  const handleShiftChange = (shiftId: string) => {
    setValue('shiftId', shiftId);
    const sh = shifts.find((s) => s.id === shiftId);
    if (sh) {
      setValue('startTime', sh.startTime);
      setValue('endTime', sh.endTime);
      setValue('breakDuration', sh.breakMinutes);
    }
  };

  const onSubmit = (values: ShiftAssignmentFormValues) => {
    const emp = scopedEmployees.find((e) => e.id === values.employeeId);
    const sh = shifts.find((s) => s.id === values.shiftId);
    if (!emp || !sh) return;

    assignShift({
      employeeId: emp.id,
      employeeName: emp.name,
      departmentName: emp.departmentName,
      teamId: emp.teamId,
      branchId: values.branchId,
      siteId: emp.siteId,
      shiftId: sh.id,
      shiftName: sh.name,
      date: values.date,
      startTime: values.startTime,
      endTime: values.endTime,
      breakDuration: values.breakDuration,
      weeklyOff: values.weeklyOff,
      location: values.location,
      notes: values.notes,
    });
    reset();
    onClose();
  };

  return (
    <FormModal
      open={open}
      onClose={onClose}
      title="Create Shift Assignment"
      subtitle="Assign or reassign a shift template to an authorised team member"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block font-semibold text-[#0B1230] mb-1">Employee</label>
            <select
              {...register('employeeId')}
              className="w-full h-10 px-3 rounded-lg border border-[#E4E6F0] bg-white text-[#0B1230]"
            >
              {scopedEmployees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name} ({e.employeeCode})
                </option>
              ))}
            </select>
            {errors.employeeId && <p className="mt-1 text-[#E05252]">{errors.employeeId.message}</p>}
          </div>

          <div>
            <label className="block font-semibold text-[#0B1230] mb-1">Shift</label>
            <select
              {...register('shiftId')}
              onChange={(e) => handleShiftChange(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-[#E4E6F0] bg-white text-[#0B1230]"
            >
              {shifts.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.startTime}–{s.endTime})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-[#0B1230] mb-1">Effective Date</label>
            <input
              type="date"
              {...register('date')}
              className="w-full h-10 px-3 rounded-lg border border-[#E4E6F0] bg-white text-[#0B1230]"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#0B1230] mb-1">Branch</label>
            <select
              {...register('branchId')}
              onChange={(e) => {
                setValue('branchId', e.target.value);
                const br = branches.find((b) => b.id === e.target.value);
                if (br) setValue('location', br.name);
              }}
              className="w-full h-10 px-3 rounded-lg border border-[#E4E6F0] bg-white text-[#0B1230]"
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-[#0B1230] mb-1">Work Location / Site</label>
            <input
              type="text"
              {...register('location')}
              className="w-full h-10 px-3 rounded-lg border border-[#E4E6F0] text-[#0B1230]"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#0B1230] mb-1">Weekly Off</label>
            <select
              {...register('weeklyOff')}
              className="w-full h-10 px-3 rounded-lg border border-[#E4E6F0] bg-white text-[#0B1230]"
            >
              <option value="Saturday & Sunday">Saturday & Sunday</option>
              <option value="Sunday">Sunday</option>
              <option value="Wednesday">Wednesday</option>
              <option value="Monday">Monday</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-[#0B1230] mb-1">Start Time</label>
            <input
              type="time"
              {...register('startTime')}
              className="w-full h-10 px-3 rounded-lg border border-[#E4E6F0] text-[#0B1230]"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#0B1230] mb-1">End Time</label>
            <input
              type="time"
              {...register('endTime')}
              className="w-full h-10 px-3 rounded-lg border border-[#E4E6F0] text-[#0B1230]"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#0B1230] mb-1">Break Duration (min)</label>
            <input
              type="number"
              {...register('breakDuration')}
              className="w-full h-10 px-3 rounded-lg border border-[#E4E6F0] text-[#0B1230]"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-[#0B1230] mb-1">Assignment Notes</label>
          <textarea
            rows={2}
            {...register('notes')}
            placeholder="Optional coverage or handover instructions..."
            className="w-full p-3 rounded-lg border border-[#E4E6F0] text-[#0B1230]"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 font-semibold text-[#5A627A] bg-[#F7F7FC] rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 font-semibold text-white bg-[#7050F5] hover:bg-[#5D3EE0] rounded-lg"
          >
            Assign Shift
          </button>
        </div>
      </form>
    </FormModal>
  );
};
